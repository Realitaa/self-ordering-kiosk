import { db } from "#shared/database/connection.js";

export const create = async (
  orderId: number,
  method: string,
  amount: number,
) => {
  const result = await db.query(
    `INSERT INTO payments (order_id, method, amount, status) VALUES ($1, $2, $3, 'pending') RETURNING *`,
    [orderId, method, amount],
  );
  return result.rows[0];
};

export const findById = async (id: string) => {
  const result = await db.query(
    `SELECT p.*, o.tenant_id, o.customer_id, c.name as customer_name
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN customers c ON c.id = o.customer_id
     WHERE p.id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] || null;
};

export const findByOrderId = async (orderId: string) => {
  const result = await db.query(
    `SELECT * FROM payments WHERE order_id = $1 LIMIT 1`,
    [orderId],
  );
  return result.rows[0] || null;
};

export const markPaid = async (id: number) => {
  const result = await db.query(
    `UPDATE payments SET status = 'paid', paid_at = NOW() WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};

export const findByStallId = async (stallId: string) => {
  const result = await db.query(
    `SELECT p.*, o.tenant_id, c.name as customer_name
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN customers c ON c.id = o.customer_id
     WHERE o.tenant_id = $1
     ORDER BY p.id DESC`,
    [stallId],
  );
  return result.rows;
};
