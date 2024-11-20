import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HistoryItem } from '@/lib/types';

interface HistoryInterface {
  history: HistoryItem[];
}

const initialState: HistoryInterface = {
  history: [],
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setHistory: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        history: [...state.history, ...action.payload],
      };
    },
    
  },
});

export const {
  setHistory,
} = historySlice.actions;
export default historySlice.reducer;
