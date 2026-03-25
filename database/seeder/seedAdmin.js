import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAdmin() {
  const client = await db.connect();

  try {
    const email = process.env.FAUSERNAME || "admin@example.com";
    const password = process.env.FAPASSWORD || "12345678";
    const name = process.env.FANAME || "Admin";

    // cek apakah admin sudah ada
    const existing = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      console.log("Admin already exists ✅");
      return;
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // insert admin
    await client.query(
      `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      `,
      [name, email, passwordHash],
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
