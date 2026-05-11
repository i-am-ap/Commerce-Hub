import { Bell, LayoutDashboard, ShoppingCart, Store, UserRound } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logoutUser } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-foreground text-white" : "text-foreground/70 hover:bg-white/70"
  }`;

export function AppShell() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { cart, guestItems } = useAppSelector((state) => state.cart);
  const { notifications } = useAppSelector((state) => state.orders);
  const cartCount = user ? cart?.items?.length || 0 : guestItems.length;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-background/90 backdrop-blur">
        <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary px-3 py-2 font-display text-lg font-bold text-white">
              AP
            </div>
            <div>
              <div className="font-display text-lg font-semibold">Aryan Hub</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Amazon-style storefront
              </div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink className={navLinkClass} to="/products">
              Shop
            </NavLink>
            <NavLink className={navLinkClass} to="/cart">
              <span className="inline-flex items-center gap-2">
                <ShoppingCart size={16} />
                Cart {cartCount > 0 ? `(${cartCount})` : ""}
              </span>
            </NavLink>
            {user && (
              <NavLink className={navLinkClass} to="/dashboard">
                <span className="inline-flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </span>
              </NavLink>
            )}
            {user?.role === "seller" && (
              <NavLink className={navLinkClass} to="/seller">
                <span className="inline-flex items-center gap-2">
                  <Store size={16} />
                  Seller
                </span>
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink className={navLinkClass} to="/admin">
                <span className="inline-flex items-center gap-2">
                  <UserRound size={16} />
                  Admin
                </span>
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <Bell size={16} />
                {notifications.length}
              </span>
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {user.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink className={navLinkClass} to="/login">
                  Login
                </NavLink>
                <Button onClick={() => navigate("/register")}>Join now</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container-shell py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/70 bg-white/70">
        <div className="container-shell flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Built with React, Express, MongoDB, Redis, Stripe/Razorpay, Socket.io, Docker, and Nginx.</p>
          <p>Multi-role commerce platform for customers, sellers, and admins.</p>
        </div>
        <div className="container-shell py-4 text-center text-sm text-muted-foreground">
          <p>Developed and Designed with ❤️ by Aryan Palaspagar</p>
        </div>
      </footer>
    </div>
  );
}

