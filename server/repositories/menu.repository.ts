import { db } from "#shared/database/connection.js";

export const findByStallId = async (stallId: string) => {
  const result = await db.query(
    `SELECT * FROM menus WHERE tenant_id = $1 ORDER BY id`,
    [stallId],
  );

  return result.rows;
};

export const findById = async (id: string) => {
  const result = await db.query(
    `SELECT * FROM menus WHERE id = $1 LIMIT 1`,
    [id],
  );

  console.log("db:", result.rows[0])

  return result.rows[0] || null;
};

export const create = async (
  stallId: number,
  name: string,
  price: number,
  stock: number,
) => {
  const result = await db.query(
    `INSERT INTO menus (tenant_id, name, price, stock) VALUES ($1, $2, $3, $4) RETURNING *`,
    [stallId, name, price, stock],
  );

  return result.rows[0];
};

export const update = async (id: number, data: Record<string, unknown>) => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = ["name", "price", "stock"];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(data[field]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return findById(String(id));

  values.push(id);
  const result = await db.query(
    `UPDATE menus SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  return result.rows[0] || null;
};

export const updateStock = async (id: number, stock: number) => {
  const result = await db.query(
    `UPDATE menus SET stock = $1 WHERE id = $2 RETURNING *`,
    [stock, id],
  );

  return result.rows[0] || null;
};

export const deleteById = async (id: number) => {
  const result = await db.query(
    `DELETE FROM menus WHERE id = $1 RETURNING *`,
    [id],
  );

  return result.rows[0] || null;
};
