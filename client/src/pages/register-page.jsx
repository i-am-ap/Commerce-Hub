import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/features/auth/authSlice";

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(registerUser(form));
    if (!result.error) {
      navigate(form.role === "seller" ? "/seller" : "/dashboard");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Register as a customer or seller.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <select
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="customer">Customer</option>
            <option value="seller">Seller / Shopkeeper</option>
          </select>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" disabled={status === "loading"} type="submit">
            Register
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-semibold text-primary" to="/login">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

