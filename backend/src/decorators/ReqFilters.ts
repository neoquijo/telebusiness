import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const queryFilter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ReqFilters => {
    const request = ctx.switchToHttp().getRequest();
    const searchQuery = String(request.query.searchQuery)
    const from = parseInt(request.query.from, 10);
    const to = parseInt(request.query.to, 10);
    const role = String(request.query.role);
    const limit = parseInt(request.query.limit, 10) || 10;
    const skip = parseInt(request.query.skip, 10) || 0;
    const status = request.query.status ? String(request.query.status) : undefined;
    const page = parseInt(request.query.page, 10);
    const order = request.query.order === 'asc' || request.query.order === 'desc' ? request.query.order : undefined;
    const orderBy = request.query.orderBy ? String(request.query.orderBy) : undefined;
    const periodOption = request.query.periodOption ? String(request.query.periodOption) : 'createdAt'; // Добавлено
    const type = request.query.type
    return { from, to, limit, skip, status, page, order, orderBy, periodOption, searchQuery, role, type };
  },
);

export interface ReqFilters {
  type?: any;
  limit?: number;
  page?: number;
  skip?: number;
  from?: number;
  to?: number;
  status?: string;
  order?: 'asc' | 'desc';
  orderBy?: string;
  periodOption?: string;
  role?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

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
