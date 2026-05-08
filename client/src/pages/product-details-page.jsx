import { Heart, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LoadingState } from "@/components/common/loading-state";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addGuestItem, addCartItem } from "@/features/cart/cartSlice";
import { fetchProductDetails } from "@/features/products/productsSlice";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { trackEvent } from "@/lib/analytics";

export function ProductDetailsPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { selected, related } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });

  useEffect(() => {
    dispatch(fetchProductDetails(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    const loadReviews = async () => {
      const response = await api.get(`/reviews/product/${slug}`);
      setReviews(response.data.items);
    };

    loadReviews().catch(() => setReviews([]));
  }, [slug]);

  useEffect(() => {
    if (selected) {
      trackEvent("view_item", {
        item_name: selected.title,
        value: selected.price,
      });
    }
  }, [selected]);

  if (!selected) {
    return <LoadingState label="Loading product details..." />;
  }

  const handleAddToCart = () => {
    if (user) {
      dispatch(addCartItem({ productId: selected._id, quantity: 1 }));
    } else {
      dispatch(
        addGuestItem({
          productId: selected._id,
          quantity: 1,
          title: selected.title,
          image: selected.images?.[0]?.url,
          price: selected.price,
        })
      );
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    await api.post(`/reviews/product/${selected._id}`, reviewForm);
    const response = await api.get(`/reviews/product/${slug}`);
    setReviews(response.data.items);
    setReviewForm({ rating: 5, title: "", comment: "" });
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel overflow-hidden p-0">
          <img alt={selected.title} className="h-full min-h-[420px] w-full object-cover" src={selected.images?.[0]?.url} />
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge>{selected.category?.name}</Badge>
            <h1 className="text-4xl font-bold">{selected.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                {selected.averageRating || 0} ({selected.ratingCount || 0} reviews)
              </span>
              <span>Sold by {selected.seller?.name}</span>
            </div>
            <p className="text-base leading-7 text-muted-foreground">{selected.description}</p>
          </div>
          <Card className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="text-3xl font-semibold">{formatCurrency(selected.price)}</div>
              {selected.compareAtPrice ? (
                <div className="pb-1 text-sm text-muted-foreground line-through">
                  {formatCurrency(selected.compareAtPrice)}
                </div>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{selected.stock} units left in stock</p>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={handleAddToCart}>
                <ShoppingCart size={16} />
                Add to cart
              </Button>
              <Button className="gap-2" variant="outline">
                <Heart size={16} />
                Wishlist
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Key specs</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {selected.specifications?.map((spec) => (
                <div key={spec.label} className="rounded-2xl bg-muted/60 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{spec.label}</div>
                  <div className="mt-2 font-medium">{spec.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold">Customer reviews</h2>
            <p className="text-sm text-muted-foreground">Ratings update product scores in real time.</p>
          </div>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="rounded-3xl border border-border bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{review.user?.name}</div>
                  <div className="text-sm text-muted-foreground">{review.rating}/5</div>
                </div>
                <div className="mt-2 text-sm font-semibold">{review.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Leave a review</h2>
            <p className="text-sm text-muted-foreground">Verified purchases are flagged automatically.</p>
          </div>
          <form className="space-y-4" onSubmit={submitReview}>
            <select
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              value={reviewForm.rating}
              onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
            <Input
              placeholder="Review title"
              value={reviewForm.title}
              onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Textarea
              placeholder="Tell other shoppers what stood out."
              value={reviewForm.comment}
              onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
            />
            <Button disabled={!user} type="submit">
              Submit review
            </Button>
          </form>
        </Card>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">You may also like</h2>
          <p className="text-sm text-muted-foreground">Category-aware related products.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {related.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

