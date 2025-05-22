import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ReqFilters {
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
  filters?: string;
  type?: 'Channel' | 'Group' | 'User';
}

export const queryFilter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ReqFilters => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    return {
      limit: query.limit ? parseInt(query.limit) : undefined,
      page: query.page ? parseInt(query.page) : undefined,
      from: query.from ? parseInt(query.from) : undefined,
      to: query.to ? parseInt(query.to) : undefined,
      periodOption: query.periodOption,
      status: query.status,
      order: query.order as 'asc' | 'desc',
      orderBy: query.orderBy,
      searchQuery: query.searchQuery,
      startDate: query.startDate,
      endDate: query.endDate,
      filters: query.filters,
      type: query.type as 'Channel' | 'Group' | 'User'
    };
  },
);

export interface DialogFilters {
  limit?: number;
  page?: number;
  skip?: number;
  from?: number;
  to?: number;
  status?: string;
  order?: 'asc' | 'desc';
  periodOption?: string;
  type?: 'Channel' | 'Group' | 'User';
  searchQuery?: string;
}
