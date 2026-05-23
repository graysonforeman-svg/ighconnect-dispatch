"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL, clearAuth, loadAuth } from "@/lib/api";
import {
  clearPortalMode,
  getPortalMode,
  PORTAL_LABELS,
  type PortalMode,
} from "@/lib/portal";
import { DispatchDashboard } from "@/components/DispatchDashboard";
import { AdministratorDashboard } from "@/components/AdministratorDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<PortalMode | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  function handleAuthError() {
    clearAuth();
    clearPortalMode();
    router.replace("/login");
  }

  function logout() {
    clearAuth();
    clearPortalMode();
    router.replace("/login");
  }

  useEffect(() => {
    loadAuth();
    const tokens = localStorage.getItem("igh_admin_tokens");
    const mode = getPortalMode();
    if (!tokens || !mode) {
      router.replace("/login");
      return;
    }
    const { accessToken: token } = JSON.parse(tokens) as { accessToken: string };
    setAccessToken(token);
    setPortal(mode);
  }, [router]);

  if (!portal || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  const meta = PORTAL_LABELS[portal];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-400">{meta.title} portal</p>
          <h1 className="text-2xl font-bold">
            {portal === "dispatch"
              ? "IGH Connect Dispatch"
              : "IGH Connect Administration"}
          </h1>
          <p className="text-slate-400">{meta.subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">API: {API_URL}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              clearPortalMode();
              router.push("/login");
            }}
          >
            Switch portal
          </button>
          <button onClick={logout} className="btn-secondary">
            Log out
          </button>
        </div>
      </header>

      {portal === "dispatch" ? (
        <DispatchDashboard
          accessToken={accessToken}
          onAuthError={handleAuthError}
        />
      ) : (
        <AdministratorDashboard onAuthError={handleAuthError} />
      )}
    </div>
  );
}
