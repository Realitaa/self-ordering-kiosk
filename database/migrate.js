// import { readdirSync, readFileSync } from "fs";
// import { join } from "path";
// import { db } from "../shared/database/connection.js";

// async function migrate() {
//   const client = await db.connect();

//   try {
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS migrations (
//         id SERIAL PRIMARY KEY,
//         name TEXT NOT NULL UNIQUE,
//         batch INTEGER NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     // get all executed migrations
//     const { rows } = await client.query(`SELECT name FROM migrations`);
//     const executed = new Set(rows.map((r) => r.name));

//     // get all migration files
//     const files = readdirSync(join(process.cwd(), "database/migrations"))
//       .filter((f) => f.endsWith(".sql"))
//       .sort();

//     // assign batch number
//     const batchRes = await client.query(
//       `SELECT MAX(batch) as batch FROM migrations`,
//     );
//     const currentBatch = batchRes.rows[0].batch || 0;
//     const nextBatch = currentBatch + 1;

//     // run new migrations
//     for (const file of files) {
//       if (executed.has(file)) continue;

//       console.log(`Running migration: ${file}`);

//       const sql = readFileSync(
//         join(process.cwd(), "database/migrations", file),
//         "utf-8",
//       );

//       await client.query("BEGIN");
//       await client.query(sql);
//       await client.query(
//         `INSERT INTO migrations (name, batch) VALUES ($1, $2)`,
//         [file, nextBatch],
//       );
//       await client.query("COMMIT");
//     }

//     console.log("Migrations completed!");
//     1;
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error(err);
//   } finally {
//     client.release();
//     process.exit();
//   }
// }

// migrate();
