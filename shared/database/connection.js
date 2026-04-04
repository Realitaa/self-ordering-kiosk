import { Pool, Client } from "pg";
import "dotenv/config";

let localPool = null;

export const db = {
  async connect() {
    let env = process.env;

    try {
      // Dynamically import useEvent. In raw Node (migrate.js), this throws safely.
      const { useEvent } = await import('#imports');
      const event = useEvent();
      
      if (event?.context?.cloudflare?.env) {
         // Merge cloudflare environment variables over standard process.env 
        env = Object.assign({}, process.env, event.context.cloudflare.env);
      }
    } catch (err) {
      // Not in nitro environment or outside request context (e.g. running seeds directly via Node)
    }

    // Use Hyperdrive if available
    if (env.HYPERDRIVE && env.HYPERDRIVE.connectionString) {
      const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
      await client.connect();
      
      // Mimic pool client release gracefully for Hyperdrive
      client.release = () => {
        client.end().catch(console.error);
      };
      
      return client;
    }

    // Fallback to standard robust Postgres Pool (development, docker, non-serverless)
    if (!localPool) {
      localPool = new Pool({
        connectionString: env.DATABASE_URL,
      });
    }
    return await localPool.connect();
  },

  async query(text, params) {
    const client = await this.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }
};
