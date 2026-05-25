import { RAILWAY_API_BASE_URL } from "@igh-connect/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? RAILWAY_API_BASE_URL;

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAuth(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  if (typeof window !== "undefined") {
    localStorage.setItem("igh_admin_tokens", JSON.stringify(tokens));
  }
}

export function loadAuth() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem("igh_admin_tokens");
  if (raw) {
    const t = JSON.parse(raw) as { accessToken: string; refreshToken: string };
    accessToken = t.accessToken;
    refreshToken = t.refreshToken;
  }
}

export function clearAuth() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("igh_admin_tokens");
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (init?.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. In a separate terminal run: cd packages/api && npm.cmd run dev`
    );
  }

  if (res.status === 401 && refreshToken) {
    let r: Response;
    try {
      r = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      throw new Error(`Cannot reach API at ${API_URL}`);
    }
    if (r.ok) {
      const data = await r.json();
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      headers.Authorization = `Bearer ${data.accessToken}`;
      res = await fetch(url, { ...init, headers });
    }
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: string | Record<string, unknown>;
      message?: string;
    };
    let message: string | undefined;
    if (typeof err.error === "string") message = err.error;
    else if (typeof err.message === "string") message = err.message;
    else if (res.status === 401) message = "Session expired — sign in again";
    else if (res.status === 403) message = "Admin access only";
    throw new ApiError(message ?? `Request failed (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export { API_URL };
