import { db } from "#shared/database/connection.js";

export const create = async (name: string) => {
  const result = await db.query(
    `INSERT INTO customers (name) VALUES ($1) RETURNING *`,
    [name],
  );
  return result.rows[0];
};

export const findById = async (id: string) => {
  const result = await db.query(
    `SELECT * FROM customers WHERE id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] || null;
};
