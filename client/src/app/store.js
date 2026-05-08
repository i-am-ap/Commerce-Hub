import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import ordersReducer from "../features/orders/ordersSlice";
import productsReducer from "../features/products/productsSlice";
import uiReducer from "../features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    ui: uiReducer,
  },
});

