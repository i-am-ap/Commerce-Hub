import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LoadingState } from "@/components/common/loading-state";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { fetchCategories, fetchProducts } from "@/features/products/productsSlice";

export function ProductsPage() {
  const dispatch = useAppDispatch();
  const { categories, listing, pagination, status } = useAppSelector((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "popular",
    page: Number(searchParams.get("page") || 1),
  });
  const deferredSearch = useDeferredValue(filters.q);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      ...filters,
      q: deferredSearch,
    };

    setSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== "" && value !== 1)
      )
    );
    dispatch(fetchProducts(params));
  }, [deferredSearch, dispatch, filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    startTransition(() => {
      setFilters((current) => ({
        ...current,
        [key]: value,
        page: key === "page" ? Number(value) : 1,
      }));
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ProductFilters categories={categories} filters={filters} onChange={handleFilterChange} />

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Browse all products</h1>
            <p className="text-sm text-muted-foreground">
              Search, filter, and sort with pagination-ready API responses.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">{pagination.total} items</div>
        </div>

        {status === "loading" ? (
          <LoadingState label="Searching the catalog..." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listing.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            disabled={pagination.page <= 1}
            variant="outline"
            onClick={() => handleFilterChange("page", pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages || 1}
          </span>
          <Button
            disabled={pagination.page >= (pagination.pages || 1)}
            variant="outline"
            onClick={() => handleFilterChange("page", pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

