export type UserRole = "rider" | "driver" | "admin";
export type UserStatus = "active" | "suspended";

export type WheelchairType = "manual" | "power";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type DriverOnlineStatus = "offline" | "online";

export type RideStatus =
  | "requested"
  | "searching"
  | "matched"
  | "driver_en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled_by_rider"
  | "cancelled_by_driver"
  | "no_drivers_available"
  | "admin_assigned"
  | "rejected_by_admin";

export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed";

export type RampType = "rear" | "side" | "hydraulic";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserPublic {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  allowDispatchPortal?: boolean;
  allowAdministratorPortal?: boolean;
}

/** Admin user management list item */
export interface AdminUserRecord {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  allowDispatchPortal: boolean;
  allowAdministratorPortal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiderProfile {
  userId: string;
  wheelchairType: WheelchairType;
  wheelchairWeightLbs: number | null;
  wheelchairWidthIn: number | null;
  wheelchairLengthIn: number | null;
  accessibilityNotes: string | null;
}

export interface DriverProfile {
  userId: string;
  licenseNumber: string | null;
  insuranceExpiry: string | null;
  vehiclePlate: string | null;
  rampType: RampType | null;
  liftCapacityLbs: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  verificationStatus: VerificationStatus;
  onlineStatus: DriverOnlineStatus;
}

export interface RideLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface RidePublic {
  id: string;
  riderId: string;
  driverId: string | null;
  status: RideStatus;
  pickup: RideLocation;
  dropoff: RideLocation;
  scheduledAt: string | null;
  fareEstimateCents: number | null;
  fareFinalCents: number | null;
  distanceMeters: number | null;
  durationSeconds: number | null;
  accessibilityNotes: string | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooking {
  ride: RidePublic;
  riderName: string;
  riderEmail: string;
  riderPhone: string | null;
}

export interface AssignableDriver {
  driverId: string;
  email: string;
  phone: string | null;
  vehiclePlate: string | null;
  onlineStatus: DriverOnlineStatus;
}

export interface DriverLocationPublic {
  driverId: string;
  lat: number;
  lng: number;
  heading: number | null;
  updatedAt: string;
}

export interface RideOffer {
  rideId: string;
  expiresAt: string;
  pickup: RideLocation;
  dropoff: RideLocation;
  fareEstimateCents: number | null;
  distanceMeters: number | null;
}
