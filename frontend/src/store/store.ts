import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import analysesReducer from "./slices/analysesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analyses: analysesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
