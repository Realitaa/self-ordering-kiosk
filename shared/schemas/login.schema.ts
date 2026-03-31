import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string("Password dibutuhkan").min(1, "Password dibutuhkan"),
});

export type LoginInput = z.infer<typeof loginSchema>;
