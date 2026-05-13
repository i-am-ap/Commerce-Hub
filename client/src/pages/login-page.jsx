import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginUser(form));
    if (!result.error) {
      navigate(location.state?.from?.pathname || "/dashboard");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Login with JWT cookie auth.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {/* <Button className="w-full" disabled={status === "loading"} type="submit">
            Login
          </Button> */}

          <Button className="w-full" disabled={status === "loading"} type="submit">
            Login
          </Button>

          <div className="flex justify-center pt-2">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/google`,
                    {
                      credential: credentialResponse.credential,
                    },
                    {
                      withCredentials: true,
                    }
                  );

                  console.log(response.data);

                  navigate("/dashboard");
                } catch (error) {
                  console.error(error);
                }
              }}
              onError={() => {
                console.log("Google Login Failed");
              }}
            />
          </div>

        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link className="text-primary" to="/forgot-password">
            Forgot password?
          </Link>
          <Link className="text-primary" to="/register">
            Create account
          </Link>
        </div>
      </Card>
    </div>
  );
}

