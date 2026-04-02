import * as stallRepo from "#server/repositories/stall.repository";
import { transformStall, transformStallList } from "#server/utils/transformers";
import { NotFoundError, ForbiddenError } from "~~/server/utils/exceptions";
import type { UpdateStallInput } from "#shared/schemas/stall.schema";

export const getStallsByOwner = async (ownerId: number) => {
  const stalls = await stallRepo.findByOwnerId(ownerId);
  return transformStallList(stalls);
};

export const getStallById = async (id: string) => {
  const stall = await stallRepo.findById(id);
  if (!stall) throw new NotFoundError("Kios tidak ditemukan");
  return transformStall(stall);
};

export const createStall = async (name: string, ownerId: number) => {
  const stall = await stallRepo.create(name, ownerId);
  return transformStall(stall);
};

export const updateStall = async (
  id: string,
  userId: number,
  userRole: string,
  data: UpdateStallInput,
) => {
  const stall = await stallRepo.findById(id);
  if (!stall) throw new NotFoundError("Kios tidak ditemukan");

  if (userRole !== "admin" && stall.owner_id !== userId) {
    throw new ForbiddenError("Anda tidak memiliki akses untuk mengubah kios ini");
  }

  if (data.name) {
    const updated = await stallRepo.update(stall.id, data.name);
    return transformStall(updated);
  }

  return transformStall(stall);
};

export const deleteStall = async (
  id: string,
  userId: number,
  userRole: string,
) => {
  const stall = await stallRepo.findById(id);
  if (!stall) throw new NotFoundError("Kios tidak ditemukan");

  if (userRole !== "admin" && stall.owner_id !== userId) {
    throw new ForbiddenError("Anda tidak memiliki akses untuk menghapus kios ini");
  }

  await stallRepo.deleteById(stall.id);
};
