"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { RidePublic, AdminBooking, AssignableDriver } from "@igh-connect/shared";
import { api, ApiError } from "@/lib/api";
import { connectAdminSocket } from "@/lib/socket";
import { BookingCard } from "@/components/BookingCard";

const OpsMap = dynamic(
  () => import("@/components/OpsMap").then((m) => m.OpsMap),
  { ssr: false, loading: () => <p className="text-slate-400">Loading map…</p> }
);

type Driver = {
  driverId: string;
  email: string;
  lat: number;
  lng: number;
  vehiclePlate: string | null;
};

type Tab = "bookings" | "ops";

export function DispatchDashboard({
  accessToken,
  onAuthError,
}: {
  accessToken: string;
  onAuthError: () => void;
}) {
  const [rides, setRides] = useState<RidePublic[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignableDrivers, setAssignableDrivers] = useState<AssignableDriver[]>([]);
  const [assignDriverId, setAssignDriverId] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>("bookings");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoadError(null);
    const [ridesRes, bookingsRes, driversRes, assignableRes] = await Promise.all([
      api<{ rides: RidePublic[] }>("/admin/rides"),
      api<{ bookings: AdminBooking[] }>("/admin/bookings"),
      api<{ drivers: Driver[] }>("/admin/drivers/online"),
      api<{ drivers: AssignableDriver[] }>("/admin/drivers/assignable"),
    ]);
    setRides(ridesRes.rides);
    setBookings(bookingsRes.bookings);
    setDrivers(driversRes.drivers);
    setAssignableDrivers(assignableRes.drivers);
  }, []);

  useEffect(() => {
    fetchData()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          onAuthError();
          return;
        }
        setLoadError(
          err instanceof Error ? err.message : "Failed to load dispatch data"
        );
      })
      .finally(() => setLoading(false));

    const socket = connectAdminSocket(accessToken);
    socket.connect();
    socket.on("rides:live", () => fetchData());
    socket.on("drivers:online", () => fetchData());
    socket.on("driver:location", (p: Driver) => {
      setDrivers((prev) => {
        const idx = prev.findIndex((d) => d.driverId === p.driverId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], lat: p.lat, lng: p.lng };
          return next;
        }
        if (p.email) return [...prev, p];
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, fetchData, onAuthError]);

  async function assignRide(rideId: string) {
    const driverId = assignDriverId[rideId];
    if (!driverId) return;
    setActionBusy(rideId);
    try {
      await api(`/admin/rides/${rideId}/assign`, {
        method: "POST",
        body: JSON.stringify({ driverId }),
      });
      setAssignDriverId((s) => ({ ...s, [rideId]: "" }));
      await fetchData();
    } finally {
      setActionBusy(null);
    }
  }

  async function rejectBooking(rideId: string) {
    if (!confirm("Reject this booking? The rider will be notified.")) return;
    setActionBusy(rideId);
    try {
      await api(`/admin/rides/${rideId}/reject`, { method: "POST" });
      await fetchData();
    } finally {
      setActionBusy(null);
    }
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
                    err instanceof Error ? err.message : "Failed to load dispatch data"
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
        <p className="mb-4 text-slate-400">Loading dispatch…</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={tab === "bookings" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("bookings")}
        >
          Bookings ({bookings.length})
        </button>
        <button
          className={tab === "ops" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("ops")}
        >
          Operations
        </button>
      </div>

      {tab === "bookings" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Incoming bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-slate-400">No bookings waiting for dispatch.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.ride.id}
                  booking={booking}
                  drivers={assignableDrivers}
                  assignDriverId={assignDriverId[booking.ride.id] ?? ""}
                  onAssignDriverIdChange={(id) =>
                    setAssignDriverId((s) => ({ ...s, [booking.ride.id]: id }))
                  }
                  onAssign={() => assignRide(booking.ride.id)}
                  onReject={() => rejectBooking(booking.ride.id)}
                  busy={actionBusy === booking.ride.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "ops" && (
        <div className="grid gap-6">
          <div className="card">
            <h2 className="mb-3 text-lg font-semibold">Live map</h2>
            <OpsMap rides={rides} drivers={drivers} />
          </div>

          <div className="card">
            <h2 className="mb-3 text-lg font-semibold">Active trips</h2>
            <div className="space-y-3">
              {rides.filter((r) =>
                ["matched", "driver_en_route", "arrived", "in_progress"].includes(
                  r.status
                )
              ).length === 0 && (
                <p className="text-slate-400">No active trips on the road</p>
              )}
              {rides
                .filter((r) =>
                  ["matched", "driver_en_route", "arrived", "in_progress"].includes(
                    r.status
                  )
                )
                .map((ride) => (
                  <div
                    key={ride.id}
                    className="rounded-lg border border-slate-700 bg-slate-900/50 p-3"
                  >
                    <span className="rounded bg-brand-600/30 px-2 py-0.5 text-sm capitalize">
                      {ride.status.replace(/_/g, " ")}
                    </span>
                    <p className="mt-2 text-sm">
                      {ride.pickup.address} → {ride.dropoff.address}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
