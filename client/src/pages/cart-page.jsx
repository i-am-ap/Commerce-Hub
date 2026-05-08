import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  applyCoupon,
  fetchCart,
  removeCartItem,
  removeGuestItem,
  updateCartItem,
  updateGuestItem,
} from "@/features/cart/cartSlice";
import { formatCurrency } from "@/lib/currency";

export function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { cart, guestItems } = useAppSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const items = user ? cart?.items || [] : guestItems;
  const subtotal = user
    ? cart?.subtotal || 0
    : guestItems.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0);
  const total = user ? cart?.total || 0 : subtotal;

  if (!items.length) {
    return <EmptyState description="Your cart is waiting for its first product." title="Cart is empty" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card
            key={user ? item.product?._id || item.product : item.productId}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <img
              alt={item.title}
              className="h-28 w-full rounded-3xl object-cover sm:w-28"
              src={item.image || item.product?.images?.[0]?.url}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.priceSnapshot || item.price)} each
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                className="w-24"
                min="1"
                type="number"
                value={item.quantity}
                onChange={(event) =>
                  user
                    ? dispatch(
                        updateCartItem({
                          productId: item.product?._id || item.product,
                          quantity: Number(event.target.value),
                        })
                      )
                    : dispatch(
                        updateGuestItem({
                          productId: item.productId,
                          quantity: Number(event.target.value),
                        })
                      )
                }
              />
              <Button
                variant="ghost"
                onClick={() =>
                  user
                    ? dispatch(removeCartItem(item.product?._id || item.product))
                    : dispatch(removeGuestItem(item.productId))
                }
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Order summary</h2>
          <p className="text-sm text-muted-foreground">Persistent cart with coupon support.</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {user ? (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>- {formatCurrency(cart?.discountAmount || 0)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        {user ? (
          <div className="space-y-3">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
            />
            <Button className="w-full" variant="outline" onClick={() => dispatch(applyCoupon(couponCode))}>
              Apply coupon
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Log in to sync your cart across devices and unlock coupons.
          </p>
        )}
        <Button className="w-full" onClick={() => (user ? navigate("/checkout") : navigate("/login"))}>
          {user ? "Proceed to checkout" : "Login to checkout"}
        </Button>
        <Link className="block text-center text-sm font-semibold text-primary" to="/products">
          Continue shopping
        </Link>
      </Card>
    </div>
  );
}
