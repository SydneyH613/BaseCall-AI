import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types";

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("basecall_token"),
  user: JSON.parse(localStorage.getItem("basecall_user") ?? "null"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    credentialsSet(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("basecall_token", action.payload.token);
      localStorage.setItem("basecall_user", JSON.stringify(action.payload.user));
    },
    loggedOut(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("basecall_token");
      localStorage.removeItem("basecall_user");
    },
  },
});

export const { credentialsSet, loggedOut } = authSlice.actions;
export default authSlice.reducer;
