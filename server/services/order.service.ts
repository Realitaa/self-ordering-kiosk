import * as orderRepo from "#server/repositories/order.repository";
import * as orderItemRepo from "#server/repositories/orderItem.repository";
import * as customerRepo from "#server/repositories/customer.repository";
import * as menuRepo from "#server/repositories/menu.repository";
import * as paymentRepo from "#server/repositories/payment.repository";
import * as stallRepo from "#server/repositories/stall.repository";
import {
  transformOrder,
  transformOrderList,
  transformOrderItemList,
} from "#server/utils/transformers";
import { NotFoundError, BadRequestError } from "~~/server/utils/exceptions";
import type { CreateOrderInput } from "#shared/schemas/order.schema";

export const createOrder = async (data: CreateOrderInput) => {
  // 1. Validate stall exists
  const stall = await stallRepo.findById(String(data.stall_id));
  if (!stall) throw new NotFoundError("Kios tidak ditemukan");

  // 2. Validate all menu items exist and belong to this stall
  const menuItems = [];
  for (const item of data.items) {
    const menu = await menuRepo.findById(String(item.menu_id));
    if (!menu) {
      throw new NotFoundError(`Menu dengan ID ${item.menu_id} tidak ditemukan`);
    }
    if (menu.tenant_id != data.stall_id) {
      throw new BadRequestError(
        { items: [`Menu "${menu.name}" bukan milik kios ini`] },
        "Menu tidak valid",
      );
    }
    if (menu.stock < item.qty) {
      throw new BadRequestError(
        { items: [`Stok "${menu.name}" tidak mencukupi (sisa: ${menu.stock})`] },
        "Stok tidak mencukupi",
      );
    }
    menuItems.push({ ...item, price: menu.price, name: menu.name, currentStock: menu.stock });
  }

  // 3. Calculate total price
  const totalPrice = menuItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  // 4. Create customer
  const customer = await customerRepo.create(data.customer_name);

  // 5. Create order
  const order = await orderRepo.create(customer.id, data.stall_id, totalPrice);

  // 6. Create order items (snapshot prices)
  const orderItems = await orderItemRepo.createMany(
    order.id,
    menuItems.map((item) => ({
      menu_id: item.menu_id,
      qty: item.qty,
      price: item.price,
    })),
  );

  // 7. Deduct stock
  for (const item of menuItems) {
    await menuRepo.updateStock(item.menu_id, item.currentStock - item.qty);
  }

  // 8. Create payment
  const payment = await paymentRepo.create(order.id, data.payment_method, totalPrice);

  // 9. Fetch full order with JOINs
  const fullOrder = await orderRepo.findById(String(order.id));

  return {
    order: transformOrder(fullOrder),
    items: transformOrderItemList(orderItems),
    payment: {
      id: payment.id,
      order_id: payment.order_id,
      method: payment.method,
      amount: payment.amount,
      status: payment.status,
    },
  };
};

export const getOrdersByStall = async (stallId: string) => {
  const orders = await orderRepo.findByStallId(stallId);
  return transformOrderList(orders);
};

export const getOrderById = async (id: string) => {
  const order = await orderRepo.findById(id);
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

  const items = await orderItemRepo.findByOrderId(id);
  const payment = await paymentRepo.findByOrderId(id);

  return {
    order: transformOrder(order),
    items: transformOrderItemList(items),
    payment: payment
      ? {
          id: payment.id,
          order_id: payment.order_id,
          method: payment.method,
          amount: payment.amount,
          status: payment.status,
          paid_at: payment.paid_at,
        }
      : null,
  };
};

export const markOrderComplete = async (
  id: string,
  userId: number,
  userRole: string,
) => {
  const order = await orderRepo.findById(id);
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

  // Ownership check: only stall owner or admin
  if (userRole !== "admin") {
    const stall = await stallRepo.findById(String(order.tenant_id));
    if (!stall || stall.owner_id !== userId) {
      throw new BadRequestError(
        { id: ["Anda tidak memiliki akses"] },
        "Akses ditolak",
      );
    }
  }

  const updated = await orderRepo.updateStatus(order.id, "done");
  return transformOrder({ ...updated, customer_name: order.customer_name });
};
