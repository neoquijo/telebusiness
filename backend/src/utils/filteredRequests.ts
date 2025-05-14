import { Model, Document, Types, FilterQuery, RootFilterQuery } from 'mongoose';

interface FilterOptions {
  limit?: number;
  page?: number;
  from?: number;
  to?: number;
  periodOption?: string;
  status?: string;
  order?: 'asc' | 'desc';
  orderBy?: string;
}

// interface AdditionalQuery {
//   [key: string]: unknown;
// }

export interface FilteredResponse<T> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export const filteredRequest = async <T extends Document>(
  model: Model<T>,
  filterOptions: FilterOptions = {},
  additionalQuery: RootFilterQuery<FilterQuery<T>> = {},
  populateFields?: string[],
  ignoreFields?: string[]
): Promise<FilteredResponse<T>> => {
  try {
    const {
      limit = 10,
      page = 1,
      from: startTime,
      to: endTime,
      periodOption = 'createdAt',
      status,
      order: sortOrder = 'desc',
      orderBy = 'createdAt',
    } = filterOptions;

    const safeLimit = Math.max(limit, 1);
    let safePage = Math.max(page, 1);
    if (isNaN(page)) safePage = 1;

    const skip = (safePage - 1) * safeLimit;

    const query: {
      [key: string]: any;
      status?: string;
    } = {};

    if (startTime !== undefined && !isNaN(startTime)) {
      query[periodOption] = { ...(query[periodOption] || {}), $gte: startTime };
    }

    if (endTime !== undefined && !isNaN(endTime)) {
      query[periodOption] = { ...(query[periodOption] || {}), $lte: endTime };
    }

    if (status !== undefined && status !== 'undefined') {
      query.status = status;
    }

    const projection: { [key: string]: 0 } = {};
    if (ignoreFields && ignoreFields.length > 0) {
      for (const field of ignoreFields) {
        projection[field] = 0;
      }
    }

    let requestQuery = model
      .find({ ...query, ...additionalQuery }, projection)
      .sort({
        [(typeof orderBy === 'string' && orderBy !== '') ? orderBy : 'createdAt']:
          sortOrder === 'asc' ? 1 : -1,
      })
      .limit(safeLimit)
      .skip(skip);

    if (populateFields) {
      for (const field of populateFields) {
        requestQuery = requestQuery.populate(field);
      }
    }

    const docs = await requestQuery.exec();

    const totalDocs = await model.countDocuments({
      ...query,
      ...additionalQuery,
    });

    const totalPages = totalDocs > 0 ? Math.ceil(totalDocs / safeLimit) : 1;

    const response: FilteredResponse<T> = {
      currentPage: safePage,
      pageSize: safeLimit,
      totalItems: totalDocs,
      totalPages,
      items: docs,
    };

    return response;
  } catch (error) {
    throw error;
  }
};
