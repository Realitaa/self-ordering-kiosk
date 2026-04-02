import { z } from "zod";

export const createStallSchema = z.object({
  name: z.string("Nama dibutuhkan").min(1, "Nama dibutuhkan"),
});

export const updateStallSchema = z.object({
  name: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .optional(),
});

export type CreateStallInput = z.infer<typeof createStallSchema>;
export type UpdateStallInput = z.infer<typeof updateStallSchema>;
