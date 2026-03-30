import * as userRepo from "#server/repositories/user.repository";
import { NotFoundError } from "~~/server/utils/exceptions";
import { transformUser } from "#server/utils/transformers";

export const updateProfilePicture = async (id: string, pfpId: number) => {
  const user = await userRepo.findById(id);

  if (!user) throw new NotFoundError("Pengguna tidak ditemukan");

  const updatedUser = await userRepo.updateProfilePicture(user.id, pfpId);

  return transformUser(updatedUser);
};

export const updateUsername = async (id: string, username: string) => {
  const user = await userRepo.findById(id);

  if (!user) throw new NotFoundError("Pengguna tidak ditemukan");

  const updatedUser = await userRepo.updateUsername(user.id, username);

  return transformUser(updatedUser);
};