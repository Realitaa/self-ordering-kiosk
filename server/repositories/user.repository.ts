import { db } from "#shared/database/connection.js";
import type { CreateUserInput } from "#shared/schemas/user.schema";

export const findByEmail = async (email: string) => {
  const result = await db.query(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );

  return result.rows[0] || null;
};

export const findById = async (id: string) => {
  const result = await db.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [
    id,
  ]);

  return result.rows[0] || null;
};

export const findAll = async () => {
  const result = await db.query(`SELECT * FROM users ORDER BY id DESC`);
  return result.rows;
};

export const create = async (data: CreateUserInput & { password: string }) => {
  const result = await db.query(
    `INSERT INTO users (fullname, email, password, username, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.fullname, data.email, data.password, data.username || null, data.role],
  );

  return result.rows[0];
};

export const update = async (id: number, data: Record<string, unknown>) => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = ["fullname", "email", "password", "username", "role"];

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
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  return result.rows[0] || null;
};

export const updateProfilePicture = async (id: number, pfpId: number) => {
  const result = await db.query(
    `UPDATE users SET pfp_id = $1 WHERE id = $2 RETURNING *`,
    [pfpId, id],
  );

  return result.rows[0] || null;
};

export const updateUsername = async (id: number, username: string) => {
  const result = await db.query(
    `UPDATE users SET username = $1 WHERE id = $2 RETURNING *`,
    [username, id],
  );

  return result.rows[0] || null;
};

export const deleteById = async (id: number) => {
  const result = await db.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id],
  );

  return result.rows[0] || null;
};