import { isRejectedWithValue } from "@reduxjs/toolkit"
// import { toast } from "react-toastify"
import { Middleware, MiddlewareAPI } from "redux"
// interface ErrorPayload {
//   data: {
//     message: string;
//   };
// }
export const rtkQueryErrorLogger: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    if (api)

      if (isRejectedWithValue(action)) {
        // const errorPayload = action.payload as ErrorPayload;
        console.log(`Error:`)
        console.log(action)
        // toast.error(errorPayload.data?.message);
      }

    return next(action);
  }
