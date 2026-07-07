import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Analysis } from "../../types";

interface AnalysesState {
  items: Analysis[];
}

const initialState: AnalysesState = {
  items: [],
};

const analysesSlice = createSlice({
  name: "analyses",
  initialState,
  reducers: {
    analysesLoaded(state, action: PayloadAction<Analysis[]>) {
      state.items = action.payload;
    },
    analysisAdded(state, action: PayloadAction<Analysis>) {
      state.items.unshift(action.payload);
    },
    analysisRemoved(state, action: PayloadAction<number>) {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
});

export const { analysesLoaded, analysisAdded, analysisRemoved } = analysesSlice.actions;
export default analysesSlice.reducer;
