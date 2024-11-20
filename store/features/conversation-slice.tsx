import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialState = {
  conversationData: any;
};

const initialState: any = {
  conversationData: [],
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversationData: (state, action: PayloadAction<any>) => {
      const newArray = [...state.conversationData, action.payload]
      state.conversationData.push(action.payload);
    },
    emptyConversationData: (state) => {
      state.conversationData = []; // Reset to an empty array
    },
  },
});

export const { setConversationData, emptyConversationData } = conversationSlice.actions;
export default conversationSlice.reducer;
