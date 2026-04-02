import { db } from "#shared/database/connection.js";

export const findAll = async () => {
  const result = await db.query(`SELECT * FROM stalls ORDER BY id`);
  return result.rows;
};


export const create = async (name: string, ownerId: number) => {
  const result = await db.query(
    `INSERT INTO stalls (name, owner_id) VALUES ($1, $2) RETURNING *`,
    [name, ownerId],
  );

  return result.rows[0];
};

export const findByOwnerId = async (ownerId: number) => {
  const result = await db.query(
    `SELECT * FROM stalls WHERE owner_id = $1 ORDER BY id`,
    [ownerId],
  );

  return result.rows;
};

export const findById = async (id: string) => {
  const result = await db.query(
    `SELECT * FROM stalls WHERE id = $1 LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const update = async (id: number, name: string) => {
  const result = await db.query(
    `UPDATE stalls SET name = $1 WHERE id = $2 RETURNING *`,
    [name, id],
  );

  return result.rows[0] || null;
};

export const deleteById = async (id: number) => {
  const result = await db.query(
    `DELETE FROM stalls WHERE id = $1 RETURNING *`,
    [id],
  );

  return result.rows[0] || null;
};