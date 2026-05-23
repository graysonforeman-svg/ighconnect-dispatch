"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Rider = { id: string; email: string; displayName: string };

const PRESETS = [
  {
    label: "Medical center → Home",
    pickup: { lat: 40.7128, lng: -74.006, address: "100 Health Plaza, New York, NY" },
    dropoff: { lat: 40.758, lng: -73.9855, address: "350 W 42nd St, New York, NY" },
  },
  {
    label: "Station → Community center",
    pickup: { lat: 40.7527, lng: -73.9772, address: "200 Transit Ave, New York, NY" },
    dropoff: { lat: 40.7282, lng: -73.9942, address: "50 Park Lane, New York, NY" },
  },
];

export function CreateTestBooking({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [riderId, setRiderId] = useState("");
  const [pickupAddress, setPickupAddress] = useState(PRESETS[0].pickup.address);
  const [dropoffAddress, setDropoffAddress] = useState(PRESETS[0].dropoff.address);
  const [pickup, setPickup] = useState(PRESETS[0].pickup);
  const [dropoff, setDropoff] = useState(PRESETS[0].dropoff);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    api<{ riders: Rider[] }>("/admin/riders")
      .then((r) => {
        setRiders(r.riders);
        if (r.riders[0]) setRiderId(r.riders[0].id);
      })
      .catch(() => setError("Could not load riders"));
  }, [open]);

  function applyPreset(index: number) {
    const p = PRESETS[index];
    setPickup(p.pickup);
    setDropoff(p.dropoff);
    setPickupAddress(p.pickup.address);
    setDropoffAddress(p.dropoff.address);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/admin/bookings", {
        method: "POST",
        body: JSON.stringify({
          riderId: riderId || undefined,
          pickup: { ...pickup, address: pickupAddress },
          dropoff: { ...dropoff, address: dropoffAddress },
        }),
      });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn-primary mb-6"
        onClick={() => setOpen(true)}
      >
        + Create test booking (no mobile app needed)
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="card mb-6 max-w-xl space-y-4 border border-brand-600/40"
    >
      <h3 className="text-lg font-semibold">New test booking</h3>
      <p className="text-sm text-slate-400">
        Creates a WAV ride for dispatch testing without the rider mobile app.
      </p>

      {error && (
        <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm text-slate-400">Rider</label>
        <select
          className="input"
          value={riderId}
          onChange={(e) => setRiderId(e.target.value)}
        >
          {riders.map((r) => (
            <option key={r.id} value={r.id}>
              {r.displayName} ({r.email})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className="btn-secondary text-sm"
            onClick={() => applyPreset(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Origin</label>
        <input
          className="input"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Destination</label>
        <input
          className="input"
          value={dropoffAddress}
          onChange={(e) => setDropoffAddress(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating…" : "Create booking"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
