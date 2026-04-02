import bcrypt from "bcrypt";
import { db } from "../../shared/database/connection.js";
import "dotenv/config";

async function seedAdmin() {
  const client = await db.connect();

  try {
    const email = "user@example.com";
    const password = "12345678";
    const fullname = "User";
    const role = "tenant";

    // cek apakah user sudah ada
    const existing = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      console.log("User already exists!");
      return;
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // insert user
    await client.query(
      `
      INSERT INTO users (fullname, email, password, role)
      VALUES ($1, $2, $3, $4)
      `,
      [fullname, email, passwordHash, role],
    );

    console.log("User seed complete!");
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
