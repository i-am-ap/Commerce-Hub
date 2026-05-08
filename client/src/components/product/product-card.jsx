import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addGuestItem, addCartItem } from "@/features/cart/cartSlice";
import { formatCurrency } from "@/lib/currency";
import { trackEvent } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleAddToCart = () => {
    trackEvent("add_to_cart", {
      item_name: product.title,
      value: product.price,
    });

    if (user) {
      dispatch(addCartItem({ productId: product._id, quantity: 1 }));
      return;
    }

    dispatch(
      addGuestItem({
        productId: product._id,
        quantity: 1,
        title: product.title,
        image: product.images?.[0]?.url,
        price: product.price,
      })
    );
  };

  return (
    <Card className="group flex h-full flex-col gap-4 p-4">
      <Link className="overflow-hidden rounded-3xl bg-muted" to={`/products/${product.slug}`}>
        <img
          alt={product.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          src={product.images?.[0]?.url}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Badge>{product.category?.name || "Featured"}</Badge>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {product.averageRating || 0}
          </span>
        </div>
        <div>
          <Link className="text-lg font-semibold hover:text-primary" to={`/products/${product.slug}`}>
            {product.title}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.summary || product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button className="px-3" variant="ghost">
              <Heart size={16} />
            </Button>
            <Button onClick={handleAddToCart}>Add</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

