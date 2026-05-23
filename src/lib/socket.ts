import { io, Socket } from "socket.io-client";
import { RAILWAY_API_BASE_URL } from "@igh-connect/shared";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  RAILWAY_API_BASE_URL;

export function connectAdminSocket(accessToken: string): Socket {
  return io(WS_URL, {
    auth: { token: accessToken },
    transports: ["websocket"],
  });
}
