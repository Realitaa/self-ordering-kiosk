import bcrypt from "bcryptjs";
import { db } from "../../shared/database/connection.js";
import "dotenv/config";

async function seedAdmin() {
  const client = await db.connect();

  try {
    const email = process.env.FAUSERNAME || "admin@example.com";
    const password = process.env.FAPASSWORD || "12345678";
    const fullname = process.env.FANAME || "Admin";
    const role = "admin";

    // cek apakah admin sudah ada
    const existing = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      console.log("Admin already exists!");
      return;
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // insert admin
    await client.query(
      `
      INSERT INTO users (fullname, email, password, role)
      VALUES ($1, $2, $3, $4)
      `,
      [fullname, email, passwordHash, role],
    );

    console.log("Admin seed complete!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

seedAdmin();
