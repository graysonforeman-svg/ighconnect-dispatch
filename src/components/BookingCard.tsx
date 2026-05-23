"use client";

import type { AdminBooking, AssignableDriver } from "@igh-connect/shared";

function formatPrice(cents: number | null | undefined) {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

type Props = {
  booking: AdminBooking;
  drivers: AssignableDriver[];
  assignDriverId: string;
  onAssignDriverIdChange: (id: string) => void;
  onAssign: () => void;
  onReject: () => void;
  busy?: boolean;
};

export function BookingCard({
  booking,
  drivers,
  assignDriverId,
  onAssignDriverIdChange,
  onAssign,
  onReject,
  busy,
}: Props) {
  const { ride, riderName } = booking;
  const price = ride.fareFinalCents ?? ride.fareEstimateCents;
  const canDispatch = [
    "requested",
    "searching",
    "no_drivers_available",
    "admin_assigned",
  ].includes(ride.status);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60">
      <div className="border-b border-slate-700 px-4 py-2">
        <span className="rounded-full bg-brand-600/30 px-2 py-0.5 text-xs font-medium capitalize text-slate-200">
          {ride.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Origin
          </p>
          <p className="mt-1 text-sm leading-snug text-slate-200">
            {ride.pickup.address}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Destination
          </p>
          <p className="mt-1 text-sm leading-snug text-slate-200">
            {ride.dropoff.address}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-700 bg-slate-950/60 px-4 py-4">
        <p className="text-lg font-semibold text-white">{riderName}</p>
        <p className="mt-1 text-2xl font-bold text-brand-400">
          {formatPrice(price)}
        </p>
      </div>

      {canDispatch && (
        <div className="flex flex-col gap-2 border-t border-slate-700 p-4 sm:flex-row sm:flex-wrap">
          <select
            className="input min-h-[44px] flex-1 sm:min-w-[200px]"
            value={assignDriverId}
            onChange={(e) => onAssignDriverIdChange(e.target.value)}
            disabled={busy}
            aria-label="Select driver"
          >
            <option value="">Assign to driver…</option>
            {drivers.map((d) => (
              <option key={d.driverId} value={d.driverId}>
                {d.onlineStatus === "online" ? "● " : "○ "}
                {d.email}
                {d.vehiclePlate ? ` · ${d.vehiclePlate}` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary min-h-[44px] shrink-0 px-6"
            onClick={onAssign}
            disabled={busy || !assignDriverId}
          >
            Assign To
          </button>
          <button
            type="button"
            className="min-h-[44px] shrink-0 rounded-lg border border-red-800 bg-red-950/50 px-6 font-medium text-red-300 transition hover:bg-red-900/50 disabled:opacity-50"
            onClick={onReject}
            disabled={busy}
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
