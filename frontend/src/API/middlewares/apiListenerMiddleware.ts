// import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
// import { tasksApi } from "../tasksApi";
// import { projectsApi } from "../projectsApi";

// export const apiListenerMiddleware = createListenerMiddleware();

// apiListenerMiddleware.startListening({
//   matcher: isAnyOf(tasksApi.endpoints.completeTask.matchFulfilled),
//   effect: async (_, { dispatch }) => {
//     dispatch(projectsApi.util.invalidateTags(['taskStatus']));
//   }
// });