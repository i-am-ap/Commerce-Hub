import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = searchParams.get("token");
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    setMessage(response.data.message);
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-3xl font-semibold">Choose a new password</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="New password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button className="w-full" type="submit">
            Update password
          </Button>
        </form>
        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      </Card>
    </div>
  );
}

