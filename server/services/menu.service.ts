import * as menuRepo from "#server/repositories/menu.repository";
import * as stallRepo from "#server/repositories/stall.repository";
import { transformMenu, transformMenuList } from "#server/utils/transformers";
import { NotFoundError, ForbiddenError } from "~~/server/utils/exceptions";
import type { CreateMenuInput, UpdateMenuInput } from "#shared/schemas/menu.schema";

const verifyStallAccess = async (stallId: string, userId: number, userRole: string) => {
  const stall = await stallRepo.findById(stallId);
  if (!stall) throw new NotFoundError("Kios tidak ditemukan");

  if (userRole !== "admin" && stall.owner_id !== userId) {
    throw new ForbiddenError("Anda tidak memiliki akses ke kios ini");
  }

  return stall;
};

export const getMenusByStall = async (stallId: string) => {
  const menus = await menuRepo.findByStallId(stallId);
  return transformMenuList(menus);
};

export const createMenu = async (
  stallId: string,
  userId: number,
  userRole: string,
  data: CreateMenuInput,
) => {
  const stall = await verifyStallAccess(stallId, userId, userRole);

  const menu = await menuRepo.create(stall.id, data.name, data.price, data.stock);
  return transformMenu(menu);
};

export const updateMenu = async (
  menuId: string,
  userId: number,
  userRole: string,
  data: UpdateMenuInput,
) => {
  const menu = await menuRepo.findById(menuId);
  if (!menu) throw new NotFoundError("Menu tidak ditemukan");

  await verifyStallAccess(String(menu.tenant_id), userId, userRole);

  const updated = await menuRepo.update(menu.id, data);
  return transformMenu(updated);
};

export const updateMenuStock = async (
  menuId: string,
  userId: number,
  userRole: string,
  stock: number,
) => {
  const menu = await menuRepo.findById(menuId);
  if (!menu) throw new NotFoundError("Menu tidak ditemukan");

  await verifyStallAccess(String(menu.tenant_id), userId, userRole);

  const updated = await menuRepo.updateStock(menu.id, stock);
  return transformMenu(updated);
};

export const deleteMenu = async (
  menuId: string,
  userId: number,
  userRole: string,
) => {
  const menu = await menuRepo.findById(menuId);
  if (!menu) throw new NotFoundError("Menu tidak ditemukan");

  await verifyStallAccess(String(menu.tenant_id), userId, userRole);

  await menuRepo.deleteById(menu.id);
};
