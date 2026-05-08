import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

export function RoleGuard({ children, roles }) {
  const location = useLocation();
  const { initialized, user } = useAppSelector((state) => state.auth);

  if (!initialized) {
    return null;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate replace to="/" />;
  }

  return children;
}

