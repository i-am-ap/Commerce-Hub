import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await api.post("/auth/forgot-password", { email });
    setMessage(response.data.message);
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">We’ll email a secure reset link.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button className="w-full" type="submit">
            Send reset link
          </Button>
        </form>
        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      </Card>
    </div>
  );
}

