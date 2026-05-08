import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/features/auth/authSlice";
import { fetchOrders } from "@/features/orders/ordersSlice";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

export function UserDashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, notifications } = useAppSelector((state) => state.orders);
  const [wishlist, setWishlist] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    dispatch(fetchOrders());
    api
      .get("/users/wishlist")
      .then((response) => setWishlist(response.data.items))
      .catch(() => setWishlist([]));
  }, [dispatch]);

  const handleProfileSave = (event) => {
    event.preventDefault();
    dispatch(updateProfile(form));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Customer dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Review profile data, orders, notifications, and wishlist activity.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="text-2xl font-semibold">Profile</h2>
          <form className="mt-5 space-y-4" onSubmit={handleProfileSave}>
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Notifications</h2>
          <div className="mt-5 space-y-3">
            {notifications.length ? (
              notifications.map((notification) => (
                <div key={notification._id} className="rounded-2xl bg-muted/60 p-4">
                  <div className="font-semibold">{notification.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))
            ) : (
              <EmptyState
                description="Live order and system notifications appear here."
                title="No notifications yet"
              />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold">Order history</h2>
        <div className="mt-5 overflow-hidden rounded-3xl border border-border">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-muted/70 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{order._id.slice(-8)}</td>
                  <td className="px-4 py-3">{order.orderStatus}</td>
                  <td className="px-4 py-3">{order.paymentStatus}</td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold">Wishlist</h2>
        {wishlist.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {wishlist.map((product) => (
              <div key={product._id} className="rounded-3xl bg-muted/50 p-4">
                <img alt={product.title} className="h-44 w-full rounded-2xl object-cover" src={product.images?.[0]?.url} />
                <div className="mt-3 font-semibold">{product.title}</div>
                <div className="text-sm text-muted-foreground">{product.category?.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState description="Wishlist items will surface here for quick reorders." title="No wishlist items" />
          </div>
        )}
      </Card>
    </div>
  );
}

