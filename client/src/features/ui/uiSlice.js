import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    globalMessage: "",
  },
  reducers: {
    setGlobalMessage: (state, action) => {
      state.globalMessage = action.payload;
    },
  },
});

export const { setGlobalMessage } = uiSlice.actions;
export default uiSlice.reducer;
