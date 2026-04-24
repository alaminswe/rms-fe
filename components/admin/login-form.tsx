"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/lib/store/admin-store";

export function AdminLoginForm() {
  const router = useRouter();
  const login = useAdminStore((state) => state.login);
  const [email, setEmail] = useState("admin@savoria.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        const success = login(email, password);
        setLoading(false);

        if (!success) {
          setError("Invalid credentials. Use admin@savoria.local / admin123.");
          return;
        }

        router.push("/admin/dashboard");
        router.refresh();
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
        />
      </div>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}
