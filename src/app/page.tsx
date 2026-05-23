"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadAuth } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    loadAuth();
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-400">Redirecting…</p>
    </div>
  );
}
