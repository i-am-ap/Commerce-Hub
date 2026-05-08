import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchCurrentUser } from "@/features/auth/authSlice";
import { fetchCart, syncGuestCart } from "@/features/cart/cartSlice";
import { fetchNotifications } from "@/features/orders/ordersSlice";

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(syncGuestCart()).finally(() => {
        dispatch(fetchCart());
      });
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  return initialized;
}

