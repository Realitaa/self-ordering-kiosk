import * as userRepo from "#server/repositories/user.repository";
import { transformUser, transformUserList } from "#server/utils/transformers";
import { NotFoundError, ConflictError } from "~~/server/utils/exceptions";
import type { CreateUserInput, UpdateUserInput } from "#shared/schemas/user.schema";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  const users = await userRepo.findAll();
  return transformUserList(users);
};

export const createUser = async (data: CreateUserInput) => {
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ConflictError("Email sudah digunakan oleh pengguna lain");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await userRepo.create({
    ...data,
    password: hashedPassword,
  });

  return transformUser(user);
};

export const updateUser = async (id: string, data: UpdateUserInput) => {
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError("Pengguna tidak ditemukan");

  if (data.email && data.email !== user.email) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email sudah digunakan oleh pengguna lain");
    }
  }

  const updateData: Record<string, unknown> = { ...data };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  } else {
    delete updateData.password;
  }

  const updatedUser = await userRepo.update(user.id, updateData);

  return transformUser(updatedUser);
};

export const deleteUser = async (id: string) => {
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError("Pengguna tidak ditemukan");

  await userRepo.deleteById(user.id);
};
