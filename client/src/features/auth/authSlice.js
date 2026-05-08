import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/lib/api";

const initialState = {
  user: null,
  status: "idle",
  initialized: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, thunkApi) => {
  try {
    const response = await api.get("/auth/me");
    return response.data.user;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to restore session.");
  }
});

export const loginUser = createAsyncThunk("auth/loginUser", async (payload, thunkApi) => {
  try {
    const response = await api.post("/auth/login", payload);
    return response.data.user;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Login failed.");
  }
});

export const registerUser = createAsyncThunk("auth/registerUser", async (payload, thunkApi) => {
  try {
    const response = await api.post("/auth/register", payload);
    return response.data.user;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Registration failed.");
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkApi) => {
  try {
    await api.post("/auth/logout");
    return true;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Logout failed.");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, thunkApi) => {
  try {
    const response = await api.put("/users/profile", payload);
    return response.data.user;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Profile update failed.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.initialized = true;
        state.user = null;
        state.error = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      });
  },
});

export default authSlice.reducer;
