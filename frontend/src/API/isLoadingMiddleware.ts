import { Middleware, MiddlewareAPI } from "redux"

export const isLoadingMiddleware: Middleware =
  (_: MiddlewareAPI) => (next) => (action) => {
    return next(action)
  }
