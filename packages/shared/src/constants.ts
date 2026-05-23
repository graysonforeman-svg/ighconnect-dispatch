/**
 * Public Railway API URL (no trailing slash).
 * After deploy: Railway → your service → Settings → Networking → copy the HTTPS URL here.
 */
export const RAILWAY_API_BASE_URL =
  "https://igh-connect-production.up.railway.app";

export const MATCH_RADIUS_KM = 25;
export const OFFER_TIMEOUT_MS = 45_000;

/** Auto status: driver within this distance of pickup → arrived */
export const PICKUP_ARRIVAL_RADIUS_M = 100;
/** Auto status: driver beyond this distance from pickup → in_progress */
export const PICKUP_DEPART_RADIUS_M = 150;
/** Auto status: driver within this distance of dropoff → completed */
export const DROPOFF_ARRIVAL_RADIUS_M = 100;
export const BASE_FARE_CENTS = 800;
export const PER_KM_CENTS = 250;
export const PER_MINUTE_CENTS = 35;
export const MIN_FARE_CENTS = 1200;

export const BOOKING_QUEUE_STATUSES = [
  "requested",
  "searching",
  "no_drivers_available",
  "admin_assigned",
] as const;

export const RIDE_STATUS_TRANSITIONS: Record<string, string[]> = {
  requested: ["searching", "cancelled_by_rider", "admin_assigned", "rejected_by_admin"],
  searching: ["matched", "no_drivers_available", "cancelled_by_rider", "admin_assigned", "rejected_by_admin"],
  admin_assigned: ["matched", "cancelled_by_rider", "rejected_by_admin"],
  matched: ["driver_en_route", "cancelled_by_rider", "cancelled_by_driver"],
  driver_en_route: ["arrived", "cancelled_by_driver"],
  arrived: ["in_progress", "cancelled_by_driver"],
  in_progress: ["completed"],
  completed: [],
  cancelled_by_rider: [],
  cancelled_by_driver: [],
  no_drivers_available: ["searching", "cancelled_by_rider", "admin_assigned", "rejected_by_admin"],
  rejected_by_admin: [],
};

export const DRIVER_STATUS_TRANSITIONS: Record<string, string[]> = {
  matched: ["driver_en_route", "cancelled_by_driver"],
  driver_en_route: ["arrived"],
  arrived: ["in_progress"],
  in_progress: ["completed"],
};
