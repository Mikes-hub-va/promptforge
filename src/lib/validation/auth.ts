import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128, "Use 128 characters or fewer.")
  .refine((value) => /[a-z]/.test(value), "Include at least one lowercase letter.")
  .refine((value) => /[A-Z]/.test(value), "Include at least one uppercase letter.")
  .refine((value) => /\d/.test(value), "Include at least one number.");

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: passwordSchema,
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: passwordSchema,
});
