import { Input } from "@/components/ui/input";

export function ProductFilters({ categories, filters, onChange }) {
  return (
    <div className="glass-panel space-y-4 p-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">Search</label>
        <Input
          placeholder="Search products, brands, and tags"
          value={filters.q}
          onChange={(event) => onChange("q", event.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Category</label>
        <select
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
          value={filters.category}
          onChange={(event) => onChange("category", event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Sort</label>
        <select
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
          value={filters.sort}
          onChange={(event) => onChange("sort", event.target.value)}
        >
          <option value="popular">Popular</option>
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
    </div>
  );
}

