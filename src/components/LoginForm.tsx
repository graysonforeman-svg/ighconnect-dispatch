"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, API_URL, setAuth } from "@/lib/api";
import {
  type PortalMode,
  PORTAL_LABELS,
  setPortalMode,
} from "@/lib/portal";

export function LoginForm({ portal }: { portal: PortalMode }) {
  const router = useRouter();
  const meta = PORTAL_LABELS[portal];
  const [email, setEmail] = useState("admin@ighconnect.com");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{
        accessToken: string;
        refreshToken: string;
        user: { role: string };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.user.role !== "admin") {
        setError("Authorized staff access only");
        return;
      }
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      setPortalMode(portal);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
        <div>
          <Link href="/login" className="text-sm text-slate-400 hover:text-white">
            ← Back to portal selection
          </Link>
          <h1 className="mt-3 text-2xl font-bold">IGH Connect</h1>
          <p className="text-brand-400 font-medium">{meta.title} login</p>
          <p className="text-sm text-slate-400">{meta.subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">API: {API_URL}</p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-900/50 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : `Sign in to ${meta.title}`}
        </button>
      </form>
    </div>
  );
}
