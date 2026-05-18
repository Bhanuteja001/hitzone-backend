import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.number().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.number().optional(),
  role: z.enum(["user", "admin"]).default("user"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UpdateUserSchema = UserSchema.partial();
