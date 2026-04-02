import { db } from "#shared/database/connection.js";

export const create = async (
  customerId: number,
  tenantId: number,
  totalPrice: number,
) => {
  const result = await db.query(
    `INSERT INTO orders (customer_id, tenant_id, total_price, status) VALUES ($1, $2, $3, 'waiting') RETURNING *`,
    [customerId, tenantId, totalPrice],
  );
  return result.rows[0];
};

export const findById = async (id: string) => {
  const result = await db.query(
    `SELECT o.*, c.name as customer_name, s.name as stall_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     JOIN stalls s ON s.id = o.tenant_id
     WHERE o.id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] || null;
};

export const findByStallId = async (stallId: string) => {
  const result = await db.query(
    `SELECT o.*, c.name as customer_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.tenant_id = $1
     ORDER BY o.created_at DESC`,
    [stallId],
  );
  return result.rows;
};

export const updateStatus = async (
  id: number,
  status: "waiting" | "processing" | "done",
) => {
  const result = await db.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id],
  );
  return result.rows[0] || null;
};
