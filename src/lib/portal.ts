export type PortalMode = "dispatch" | "administrator";

const STORAGE_KEY = "igh_portal_mode";

export function setPortalMode(mode: PortalMode) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

export function getPortalMode(): PortalMode | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "dispatch" || raw === "administrator") return raw;
  return null;
}

export function clearPortalMode() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const PORTAL_LABELS: Record<
  PortalMode,
  { title: string; subtitle: string; loginPath: string }
> = {
  dispatch: {
    title: "Dispatch",
    subtitle: "Bookings, live map, and trip operations",
    loginPath: "/login/dispatch",
  },
  administrator: {
    title: "Administrator",
    subtitle: "Driver verification and system tools",
    loginPath: "/login/administrator",
  },
};
