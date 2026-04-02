import { z } from "zod";

export const createOrderSchema = z.object({
  customer_name: z
    .string("Nama pelanggan dibutuhkan")
    .min(1, "Nama pelanggan dibutuhkan")
    .max(255, "Nama pelanggan maksimal 255 karakter"),
  stall_id: z
    .number("Kios dibutuhkan")
    .int("ID kios harus bilangan bulat")
    .positive("ID kios harus positif"),
  items: z
    .array(
      z.object({
        menu_id: z.number().int().positive(),
        qty: z.number().int().min(1, "Minimal 1 item"),
      }),
    )
    .min(1, "Minimal 1 item harus dipilih"),
  payment_method: z.enum(["cash", "qris"], {
    message: "Metode pembayaran harus cash atau qris",
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
