import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchCart } from "@/features/cart/cartSlice";
import { checkoutOrder, fetchOrders } from "@/features/orders/ordersSlice";
import { formatCurrency } from "@/lib/currency";

export function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({
    fullName: user?.name || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: user?.phone || "",
    paymentProvider: "cod",
  });

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(
      checkoutOrder({
        paymentProvider: form.paymentProvider,
        shippingAddress: form,
        billingAddress: form,
      })
    );

    if (!result.error) {
      dispatch(fetchCart());
      dispatch(fetchOrders());
      navigate("/dashboard");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Stripe, Razorpay, and COD are supported through the backend payment abstraction.
        </p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Input
            placeholder="Full name"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <Input
            className="sm:col-span-2"
            placeholder="Address line 1"
            value={form.line1}
            onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
          />
          <Input
            className="sm:col-span-2"
            placeholder="Address line 2"
            value={form.line2}
            onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))}
          />
          <Input
            placeholder="City"
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          />
          <Input
            placeholder="State"
            value={form.state}
            onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
          />
          <Input
            placeholder="Postal code"
            value={form.postalCode}
            onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))}
          />
          <Input
            placeholder="Country"
            value={form.country}
            onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
          />
          <select
            className="sm:col-span-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
            value={form.paymentProvider}
            onChange={(event) => setForm((current) => ({ ...current, paymentProvider: event.target.value }))}
          >
            <option value="cod">Cash on delivery</option>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>
          <div className="sm:col-span-2">
            <Button type="submit">Place order</Button>
          </div>
        </form>
      </Card>

      <Card className="h-fit space-y-4">
        <h2 className="text-2xl font-semibold">Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(cart?.subtotal || 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span>- {formatCurrency(cart?.discountAmount || 0)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(cart?.total || 0)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
