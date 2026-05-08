import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { RoleGuard } from "@/components/layout/role-guard";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSocket } from "@/hooks/useSocket";
import { AdminDashboardPage } from "@/pages/admin-dashboard-page";
import { CartPage } from "@/pages/cart-page";
import { CheckoutPage } from "@/pages/checkout-page";
import { ForgotPasswordPage } from "@/pages/forgot-password-page";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProductDetailsPage } from "@/pages/product-details-page";
import { ProductsPage } from "@/pages/products-page";
import { RegisterPage } from "@/pages/register-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";
import { SellerDashboardPage } from "@/pages/seller-dashboard-page";
import { UserDashboardPage } from "@/pages/user-dashboard-page";

export default function App() {
  const initialized = useAuthBootstrap();
  usePageTracking();
  useSocket();

  if (!initialized) {
    return null;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RoleGuard roles={["customer", "seller", "admin"]}>
              <CheckoutPage />
            </RoleGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RoleGuard roles={["customer", "seller", "admin"]}>
              <UserDashboardPage />
            </RoleGuard>
          }
        />
        <Route
          path="/seller"
          element={
            <RoleGuard roles={["seller"]}>
              <SellerDashboardPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleGuard roles={["admin"]}>
              <AdminDashboardPage />
            </RoleGuard>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<Navigate replace to="/" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
