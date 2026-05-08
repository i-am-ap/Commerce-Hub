import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAdminDashboard } from "@/features/orders/ordersSlice";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

export function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { adminDashboard } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const handleApproveSeller = async (userId) => {
    await api.patch(`/admin/sellers/${userId}/approve`);
    dispatch(fetchAdminDashboard());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin panel</h1>
        <p className="text-sm text-muted-foreground">
          Approve sellers, track platform metrics, and audit users from one dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Users", adminDashboard?.stats?.users || 0],
          ["Products", adminDashboard?.stats?.products || 0],
          ["Orders", adminDashboard?.stats?.orders || 0],
          ["Revenue", formatCurrency(adminDashboard?.stats?.revenue || 0)],
          ["Pending sellers", adminDashboard?.stats?.sellersPending || 0],
        ].map(([label, value]) => (
          <Card key={label}>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-3 text-3xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="text-2xl font-semibold">Category demand</h2>
          <div className="mt-5 space-y-4">
            {(adminDashboard?.topCategories || []).map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span>{category.value}</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-primary"
                    style={{ width: `${Math.min(category.value * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Seller approvals & users</h2>
          <div className="mt-5 space-y-3">
            {(adminDashboard?.users || []).map((user) => (
              <div key={user._id} className="flex flex-col gap-3 rounded-3xl bg-muted/60 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email} · {user.role}
                  </div>
                </div>
                {user.role === "seller" && !user.isSellerApproved ? (
                  <Button onClick={() => handleApproveSeller(user._id)}>Approve seller</Button>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {user.role === "seller" ? "Approved" : "User"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold">Recent orders</h2>
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
              {(adminDashboard?.recentOrders || []).map((order) => (
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
    </div>
  );
}

