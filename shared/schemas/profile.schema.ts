import { z } from "zod";
import { profilePicture } from "#shared/const/profilePicture";

export const updateProfilePictureSchema = z.object({
  pfp_id: z.number().int().min(1).max(profilePicture.length),
});

export const updateUsernameSchema = z.object({
  username: z.string().min(3, "Nama pengguna minimal 3 karakter").max(255, "Nama pengguna maksimal 255 karakter"),
});

export type UpdateProfilePictureDTO = z.infer<
  typeof updateProfilePictureSchema
>;

export type UpdateUsernameDTO = z.infer<
  typeof updateUsernameSchema
>;