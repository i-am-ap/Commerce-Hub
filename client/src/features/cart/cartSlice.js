import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/lib/api";
import { logoutUser } from "@/features/auth/authSlice";

const guestCartKey = "commerce-hub-guest-cart";

const readGuestCart = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(guestCartKey) || "[]");
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(guestCartKey, JSON.stringify(items));
  }
};

const initialState = {
  cart: null,
  guestItems: readGuestCart(),
  status: "idle",
  error: null,
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, thunkApi) => {
  try {
    const response = await api.get("/cart");
    return response.data.item;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to fetch cart.");
  }
});

export const addCartItem = createAsyncThunk("cart/addCartItem", async (payload, thunkApi) => {
  try {
    const response = await api.post("/cart/items", payload);
    return response.data.item;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to add item.");
  }
});

export const updateCartItem = createAsyncThunk("cart/updateCartItem", async (payload, thunkApi) => {
  try {
    const response = await api.patch(`/cart/items/${payload.productId}`, {
      quantity: payload.quantity,
    });
    return response.data.item;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to update item.");
  }
});

export const removeCartItem = createAsyncThunk("cart/removeCartItem", async (productId, thunkApi) => {
  try {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data.item;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to remove item.");
  }
});

export const applyCoupon = createAsyncThunk("cart/applyCoupon", async (code, thunkApi) => {
  try {
    const response = await api.post("/cart/coupon", { code });
    return response.data.item;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to apply coupon.");
  }
});

export const syncGuestCart = createAsyncThunk("cart/syncGuestCart", async (_, thunkApi) => {
  try {
    const items = readGuestCart();
    if (!items.length) {
      return null;
    }

    const response = await api.post("/cart/sync", { items });
    writeGuestCart([]);
    return response.data.item;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to sync guest cart.");
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addGuestItem: (state, action) => {
      const existing = state.guestItems.find((item) => item.productId === action.payload.productId);

      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.guestItems.push(action.payload);
      }

      writeGuestCart(state.guestItems);
    },
    updateGuestItem: (state, action) => {
      const existing = state.guestItems.find((item) => item.productId === action.payload.productId);
      if (existing) {
        existing.quantity = action.payload.quantity;
        writeGuestCart(state.guestItems);
      }
    },
    removeGuestItem: (state, action) => {
      state.guestItems = state.guestItems.filter((item) => item.productId !== action.payload);
      writeGuestCart(state.guestItems);
    },
    clearGuestItems: (state) => {
      state.guestItems = [];
      writeGuestCart([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(syncGuestCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.cart = action.payload;
        }
        state.guestItems = [];
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.cart = null;
      });
  },
});

export const { addGuestItem, clearGuestItems, removeGuestItem, updateGuestItem } = cartSlice.actions;
export default cartSlice.reducer;
