import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["rider", "driver"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const riderProfileSchema = z.object({
  wheelchairType: z.enum(["manual", "power"]),
  wheelchairWeightLbs: z.number().positive().optional(),
  wheelchairWidthIn: z.number().positive().optional(),
  wheelchairLengthIn: z.number().positive().optional(),
  accessibilityNotes: z.string().max(500).optional(),
});

export const driverProfileSchema = z.object({
  licenseNumber: z.string().min(1).optional(),
  insuranceExpiry: z.string().optional(),
  vehiclePlate: z.string().min(1).optional(),
  rampType: z.enum(["rear", "side", "hydraulic"]).optional(),
  liftCapacityLbs: z.number().positive().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().int().min(1990).max(2030).optional(),
});

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1),
});

export const createRideSchema = z.object({
  pickup: locationSchema,
  dropoff: locationSchema,
  scheduledAt: z.string().datetime().optional(),
  accessibilityNotes: z.string().max(500).optional(),
});

export const driverLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
});

export const assignRideSchema = z.object({
  driverId: z.string().uuid(),
});

export const verifyDriverSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  note: z.string().max(500).optional(),
});

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const adminCreateBookingSchema = z.object({
  riderId: z.string().uuid().optional(),
  pickup: locationSchema,
  dropoff: locationSchema,
  accessibilityNotes: z.string().max(500).optional(),
});
