import { db } from "#shared/database/connection.js";

export const createMany = async (
  orderId: number,
  items: { menu_id: number; qty: number; price: number }[],
) => {
  const values: unknown[] = [];
  const placeholders: string[] = [];
  let paramIndex = 1;

  for (const item of items) {
    placeholders.push(
      `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`,
    );
    values.push(orderId, item.menu_id, item.qty, item.price);
    paramIndex += 4;
  }

  const result = await db.query(
    `INSERT INTO order_items (order_id, menu_id, qty, price) VALUES ${placeholders.join(", ")} RETURNING *`,
    values,
  );
  return result.rows;
};

export const findByOrderId = async (orderId: string) => {
  const result = await db.query(
    `SELECT oi.*, m.name as menu_name
     FROM order_items oi
     JOIN menus m ON m.id = oi.menu_id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [orderId],
  );
  return result.rows;
};
