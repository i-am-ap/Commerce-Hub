import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchCategories } from "@/features/products/productsSlice";
import { fetchSellerDashboard } from "@/features/orders/ordersSlice";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

export function SellerDashboardPage() {
  const dispatch = useAppDispatch();
  const { sellerDashboard } = useAppSelector((state) => state.orders);
  const { categories } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    summary: "",
    price: "",
    stock: "",
    category: "",
    tags: "",
    specifications: "",
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSellerDashboard());
  }, [dispatch]);

  const uploadImages = async () => {
    if (!imageFiles.length) {
      return [];
    }

    const payload = new FormData();
    imageFiles.forEach((file) => payload.append("images", file));

    const response = await api.post("/upload", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.items;
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setMessage("Uploading images and creating product...");
    const images = await uploadImages();
    // await api.post("/products", {
    //   ...form,
    //   images,
    //   tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
    //   specifications: form.specifications
    //     .split(",")
    //     .map((item) => item.trim())
    //     .filter(Boolean)
    //     .map((spec) => {
    //       const [label, value] = spec.split(":");

    //       return {
    //         label: label?.trim(),
    //         value: value?.trim(),
    //       };
    //     }),
    // });

    const payload = {
      ...form,
      images: images.length ? images : undefined,

      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      specifications: form.specifications
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((spec) => {
          const [label, value] = spec.split(":");

          return {
            label: label?.trim(),
            value: value?.trim(),
          };
        }),
    };

    if (editingProductId) {
      await api.put(`/products/${editingProductId}`, payload);

      setMessage("Product updated successfully.");
    } else {
      await api.post("/products", payload);

      setMessage("Product created successfully.");
    }

    setForm({
      title: "",
      description: "",
      summary: "",
      price: "",
      stock: "",
      category: "",
      tags: "",
      specifications: "",
    });
    setImageFiles([]);
    setEditingProductId
    setMessage("Product created successfully.");
    dispatch(fetchSellerDashboard());
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);

    setForm({
      title: product.title || "",
      description: product.description || "",
      summary: product.summary || "",
      price: product.price || "",
      stock: product.stock || "",
      category: product.category?._id || product.category || "",
      tags: (product.tags || []).join(", "),

      specifications: (product.specifications || [])
        .map((spec) => `${spec.label}:${spec.value}`)
        .join(", "),
    });
  };


  const handleDelete = async (productId) => {
    await api.delete(`/products/${productId}`);
    dispatch(fetchSellerDashboard());
  };

  if (!user?.isSellerApproved) {
    return (
      <Card>
        <h1 className="text-3xl font-semibold">Seller dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          Your seller account exists, but admin approval is still pending.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Seller dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Upload products, manage stock, and monitor revenue from the same workflow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Products", sellerDashboard?.stats?.totalProducts || 0],
          ["Orders", sellerDashboard?.stats?.totalOrders || 0],
          ["Revenue", formatCurrency(sellerDashboard?.stats?.revenue || 0)],
          ["Inventory value", formatCurrency(sellerDashboard?.stats?.inventoryValue || 0)],
        ].map(([label, value]) => (
          <Card key={label}>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-3 text-3xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-2xl font-semibold">Add new product</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This seller upload UI writes directly into the database via the API.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleCreateProduct}>
            <Input
              placeholder="Product title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
            <Input
              placeholder="Short summary"
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Price"
                type="number"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              />
              <Input
                placeholder="Stock"
                type="number"
                value={form.stock}
                onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
              />
            </div>
            <select
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            />
            <Input
              placeholder="Specifications (RAM: 8GB, GPU: RTX 4070)"
              value={form.specifications}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  specifications: event.target.value,
                }))
              }
            />
            <input
              multiple
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              type="file"
              onChange={(event) => setImageFiles(Array.from(event.target.files || []))}
            />
            {/* <Button type="submit">Create product</Button> */}
            <Button type="submit">
              {editingProductId ? "Update Product" : "Create Product"}
            </Button>
          </form>
          {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Manage inventory</h2>
          <div className="mt-5 space-y-4">
            {sellerDashboard?.products?.map((product) => (
              <div key={product._id} className="flex flex-col gap-3 rounded-3xl bg-muted/60 p-4 sm:flex-row sm:items-center">
                <img alt={product.title} className="h-20 w-20 rounded-2xl object-cover" src={product.images?.[0]?.url} />
                <div className="flex-1">
                  <div className="font-semibold">{product.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(product.price)} · {product.stock} in stock
                  </div>
                </div>
                {/* <Button variant="danger" onClick={() => handleDelete(product._id)}>
                  Delete
                </Button> */}
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(product)}>
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold">Recent seller orders</h2>
        <div className="mt-5 overflow-hidden rounded-3xl border border-border">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-muted/70 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {(sellerDashboard?.orders || []).map((order) => (
                <tr key={order._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{order._id.slice(-8)}</td>
                  <td className="px-4 py-3">{order.user?.name}</td>
                  <td className="px-4 py-3">{order.orderStatus}</td>
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

