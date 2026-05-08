import { ArrowRight, Sparkles, Store, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LoadingState } from "@/components/common/loading-state";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchRecommendations,
} from "@/features/products/productsSlice";

export function HomePage() {
  const dispatch = useAppDispatch();
  const { featured, categories, recommendations, status } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
    dispatch(fetchRecommendations());
  }, [dispatch]);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[2rem] bg-hero-grid p-8 shadow-soft sm:p-10">
          <Badge>Built for interviews and production</Badge>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold sm:text-5xl">
            A modern Amazon-style marketplace for customers, sellers, and admins.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Commerce Hub blends dynamic recommendations, seller product uploads, secure checkout,
            real-time notifications, and role-based dashboards in one scalable full-stack codebase.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ variant: "primary" }), "gap-2")} to="/products">
              Explore products
              <ArrowRight size={16} />
            </Link>
            <Link className={buttonVariants({ variant: "outline" })} to="/register">
              Become a seller
            </Link>
          </div>
        </div>

        <Card className="grid gap-4">
          {[
            {
              icon: Sparkles,
              title: "AI-style recommendations",
              text: "Past orders, search behavior, and wishlist signals drive dynamic product suggestions.",
            },
            {
              icon: Store,
              title: "Seller-first workflow",
              text: "Approved sellers upload images, create products, and track revenue without manual backend entries.",
            },
            {
              icon: Truck,
              title: "Checkout to delivery",
              text: "Persistent carts, coupons, multiple payment providers, and order tracking are wired end to end.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-muted/60 p-5">
              <item.icon className="text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category._id}
            className="glass-panel block overflow-hidden p-0"
            to={`/products?category=${category.slug}`}
          >
            <img alt={category.name} className="h-44 w-full object-cover" src={category.image} />
            <div className="p-5">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Featured products</h2>
            <p className="text-sm text-muted-foreground">Curated launches and best-performing inventory.</p>
          </div>
          <Link className="text-sm font-semibold text-primary" to="/products">
            View all
          </Link>
        </div>
        {status === "loading" && !featured.length ? (
          <LoadingState label="Loading featured products..." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Recommended for you</h2>
          <p className="text-sm text-muted-foreground">
            Powered by recent demand, interests, search history, and prior order activity.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recommendations.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
