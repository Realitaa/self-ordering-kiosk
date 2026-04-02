import { z } from "zod";

export const createMenuSchema = z.object({
  name: z
    .string("Nama menu dibutuhkan")
    .min(1, "Nama menu dibutuhkan")
    .max(255, "Nama menu maksimal 255 karakter"),
  price: z
    .number("Harga dibutuhkan")
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif"),
  stock: z
    .number()
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif")
    .default(0),
});

export const updateMenuSchema = z.object({
  name: z
    .string()
    .min(1, "Nama menu tidak boleh kosong")
    .max(255, "Nama menu maksimal 255 karakter")
    .optional(),
  price: z
    .number()
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif")
    .optional(),
  stock: z
    .number()
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif")
    .optional(),
});

export const updateStockSchema = z.object({
  stock: z
    .number("Stok dibutuhkan")
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif"),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
