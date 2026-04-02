import { z } from "zod";

export const createUserSchema = z.object({
  fullname: z
    .string("Nama lengkap dibutuhkan")
    .min(1, "Nama lengkap dibutuhkan")
    .max(255, "Nama lengkap maksimal 255 karakter"),
  email: z.email("Email tidak valid"),
  password: z
    .string("Password dibutuhkan")
    .min(6, "Password minimal 6 karakter"),
  username: z
    .string()
    .min(3, "Nama pengguna minimal 3 karakter")
    .max(255, "Nama pengguna maksimal 255 karakter")
    .optional(),
  role: z.enum(["tenant", "admin"]).default("tenant"),
});

export const updateUserSchema = z.object({
  fullname: z
    .string()
    .min(1, "Nama lengkap tidak boleh kosong")
    .max(255, "Nama lengkap maksimal 255 karakter")
    .optional(),
  email: z
    .email("Email tidak valid")
    .optional(),
  username: z
    .string()
    .min(3, "Nama pengguna minimal 3 karakter")
    .max(255, "Nama pengguna maksimal 255 karakter")
    .optional(),
  role: z.enum(["tenant", "admin"]).optional(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
