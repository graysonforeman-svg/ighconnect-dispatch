"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CreateTestBooking } from "@/components/CreateTestBooking";
import { UsersManagement } from "@/components/UsersManagement";

type PendingDriver = {
  profile: { userId: string; vehiclePlate: string | null };
  user: { id: string; email: string } | null;
};

type Tab = "drivers" | "users" | "tools";

export function AdministratorDashboard({
  onAuthError,
}: {
  onAuthError: () => void;
}) {
  const [pending, setPending] = useState<PendingDriver[]>([]);
  const [tab, setTab] = useState<Tab>("drivers");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoadError(null);
    const pendingRes = await api<{ drivers: PendingDriver[] }>(
      "/admin/drivers/pending"
    );
    setPending(pendingRes.drivers);
  }, []);

  useEffect(() => {
    fetchData()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          onAuthError();
          return;
        }
        setLoadError(
          err instanceof Error ? err.message : "Failed to load admin data"
        );
      })
      .finally(() => setLoading(false));
  }, [fetchData, onAuthError]);

  async function verifyDriver(userId: string, status: "approved" | "rejected") {
    await api(`/admin/drivers/${userId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await fetchData();
  }

  return (
    <>
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {loadError}
          <button
            type="button"
            className="btn-secondary ml-3 mt-2 sm:mt-0"
            onClick={() => {
              setLoading(true);
              fetchData()
                .catch((err) => {
                  if (err instanceof ApiError && err.status === 401) {
                    onAuthError();
                    return;
                  }
                  setLoadError(
                    err instanceof Error ? err.message : "Failed to load admin data"
                  );
                })
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !loadError && (
        <p className="mb-4 text-slate-400">Loading administration…</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={tab === "drivers" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("drivers")}
        >
          Driver verification ({pending.length})
        </button>
        <button
          className={tab === "users" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("users")}
        >
          Users
        </button>
        <button
          className={tab === "tools" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("tools")}
        >
          System tools
        </button>
      </div>

      {tab === "drivers" && (
        <div className="card max-w-2xl">
          <h2 className="mb-3 text-lg font-semibold">Pending WAV drivers</h2>
          {pending.length === 0 && (
            <p className="text-slate-400">No pending verifications</p>
          )}
          {pending.map((d) => (
            <div
              key={d.profile.userId}
              className="mb-3 rounded-lg border border-slate-700 p-3"
            >
              <p className="font-medium">{d.user?.email}</p>
              <p className="text-sm text-slate-400">
                Plate: {d.profile.vehiclePlate ?? "—"}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  className="btn-primary"
                  onClick={() => verifyDriver(d.profile.userId, "approved")}
                >
                  Approve
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => verifyDriver(d.profile.userId, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && <UsersManagement onAuthError={onAuthError} />}

      {tab === "tools" && (
        <div className="max-w-2xl space-y-4">
          <p className="text-sm text-slate-400">
            Internal tools for testing and operations setup. Dispatch staff use the
            Dispatch portal for day-to-day trips.
          </p>
          <CreateTestBooking onCreated={fetchData} />
        </div>
      )}
    </>
  );
}
