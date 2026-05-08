import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/lib/api";
import { logoutUser } from "@/features/auth/authSlice";

const initialState = {
  orders: [],
  notifications: [],
  sellerDashboard: null,
  adminDashboard: null,
  status: "idle",
  error: null,
};

export const fetchOrders = createAsyncThunk("orders/fetchOrders", async (_, thunkApi) => {
  try {
    const response = await api.get("/orders");
    return response.data.items;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to load orders.");
  }
});

export const checkoutOrder = createAsyncThunk("orders/checkoutOrder", async (payload, thunkApi) => {
  try {
    const response = await api.post("/orders/checkout", payload);
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Checkout failed.");
  }
});

export const fetchNotifications = createAsyncThunk(
  "orders/fetchNotifications",
  async (_, thunkApi) => {
    try {
      const response = await api.get("/notifications");
      return response.data.items;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to load notifications.");
    }
  }
);

export const fetchSellerDashboard = createAsyncThunk(
  "orders/fetchSellerDashboard",
  async (_, thunkApi) => {
    try {
      const [dashboard, orders] = await Promise.all([api.get("/seller/dashboard"), api.get("/seller/orders")]);
      return {
        ...dashboard.data,
        orders: orders.data.items,
      };
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Unable to load seller dashboard."
      );
    }
  }
);

export const fetchAdminDashboard = createAsyncThunk("orders/fetchAdminDashboard", async (_, thunkApi) => {
  try {
    const [dashboard, users] = await Promise.all([api.get("/admin/dashboard"), api.get("/admin/users")]);
    return {
      ...dashboard.data,
      users: users.data.items,
    };
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to load admin dashboard.");
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    pushRealtimeNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications].slice(0, 20);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        state.orders = [action.payload.item, ...state.orders];
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(fetchSellerDashboard.fulfilled, (state, action) => {
        state.sellerDashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.adminDashboard = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.orders = [];
        state.notifications = [];
        state.sellerDashboard = null;
        state.adminDashboard = null;
      });
  },
});

export const { pushRealtimeNotification } = ordersSlice.actions;
export default ordersSlice.reducer;
