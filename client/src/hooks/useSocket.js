import { useEffect } from "react";
import { io } from "socket.io-client";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { pushRealtimeNotification } from "@/features/orders/ordersSlice";

export function useSocket() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true,
    });

    socket.on("notification:new", (notification) => {
      dispatch(pushRealtimeNotification(notification));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user]);
}

