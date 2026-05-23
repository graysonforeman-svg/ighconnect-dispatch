"use client";

import Link from "next/link";
import { API_URL } from "@/lib/api";
import { PORTAL_LABELS, type PortalMode } from "@/lib/portal";

const PORTALS: PortalMode[] = ["dispatch", "administrator"];

export default function PortalChooserPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">IGH Connect</h1>
          <p className="mt-2 text-slate-400">Choose how you want to sign in</p>
          <p className="mt-1 text-xs text-slate-500">API: {API_URL}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PORTALS.map((portal) => {
            const meta = PORTAL_LABELS[portal];
            return (
              <Link
                key={portal}
                href={meta.loginPath}
                className="card group block text-left transition hover:border-brand-500 hover:bg-slate-800"
              >
                <h2 className="text-xl font-semibold text-brand-400 group-hover:text-brand-300">
                  {portal === "dispatch" ? "Dispatch Login" : "Administrator Login"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">{meta.subtitle}</p>
                <span className="mt-4 inline-block text-sm font-medium text-white">
                  Continue →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
