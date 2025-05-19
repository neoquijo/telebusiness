import { Model, Document, Types, FilterQuery, RootFilterQuery, PopulateOptions } from 'mongoose';

interface FilterOptions {
  limit?: number;
  page?: number;
  from?: number;
  to?: number;
  periodOption?: string;
  status?: string;
  order?: 'asc' | 'desc';
  orderBy?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

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
  populateFields?: (string | PopulateOptions)[],
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
      searchQuery,
      startDate,
      endDate
    } = filterOptions;

    const safeLimit = Math.max(limit, 1);
    let safePage = Math.max(page, 1);
    if (isNaN(page)) safePage = 1;

    const skip = (safePage - 1) * safeLimit;

    const query: {
      [key: string]: any;
      status?: string;
    } = {};

    // Обработка временных фильтров
    if (startTime !== undefined && !isNaN(startTime)) {
      query[periodOption] = { ...(query[periodOption] || {}), $gte: startTime };
    }

    if (endTime !== undefined && !isNaN(endTime)) {
      query[periodOption] = { ...(query[periodOption] || {}), $lte: endTime };
    }

    // Дополнительная обработка дат в формате строки
    if (startDate) {
      const startTimestamp = new Date(startDate).getTime();
      if (!isNaN(startTimestamp)) {
        query[periodOption] = { ...(query[periodOption] || {}), $gte: startTimestamp };
      }
    }

    if (endDate) {
      const endTimestamp = new Date(endDate).getTime();
      if (!isNaN(endTimestamp)) {
        query[periodOption] = { ...(query[periodOption] || {}), $lte: endTimestamp };
      }
    }

    if (status !== undefined && status !== 'undefined') {
      query.status = status;
    }

    // Создание проекции для игнорируемых полей
    const projection: { [key: string]: 0 } = {};
    if (ignoreFields && ignoreFields.length > 0) {
      for (const field of ignoreFields) {
        projection[field] = 0;
      }
    }

    // Создание запроса
    let requestQuery = model
      .find({ ...query, ...additionalQuery }, projection)
      .sort({
        [(typeof orderBy === 'string' && orderBy !== '') ? orderBy : 'createdAt']:
          sortOrder === 'asc' ? 1 : -1,
      })
      .limit(safeLimit)
      .skip(skip);

    // Обработка популейшена - поддержка как строк, так и объектов PopulateOptions
    if (populateFields && populateFields.length > 0) {
      for (const field of populateFields) {
        if (typeof field === 'string') {
          // Простое популирование по строке
          requestQuery = requestQuery.populate(field);
        } else {
          // Популирование с дополнительными опциями
          requestQuery = requestQuery.populate(field as PopulateOptions);
        }
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