import * as userRepo from "#server/repositories/user.repository";
import { transformUser } from "#server/utils/transformers";
import { NotFoundError, UnauthorizedError } from "~~/server/utils/exceptions";
import bcrypt from "bcrypt";

export const login = async (email: string, password: string) => {
  const user = await userRepo.findByEmail(email);

  if (!user) throw new NotFoundError("Pengguna tidak ditemukan");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedError("Kredensial tidak valid");


  return {
    user: transformUser(user),
  };
};
