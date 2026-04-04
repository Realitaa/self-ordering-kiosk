import postgres from "postgres";
import "dotenv/config";

let localSql = null;

export const db = {
  async connect() {
    let env = process.env;
    let event = null;

    try {
      // Dynamically import useEvent. In raw Node (migrate.js), this safely fails.
      const imports = await import('#imports');
      if (imports && imports.useEvent) {
        event = imports.useEvent();
        if (event?.context?.cloudflare?.env) {
          // Merge CF bindings with process.env so it falls back gracefully
          env = Object.assign({}, process.env, event.context.cloudflare.env);
        }
      }
    } catch (err) {
      // Not in a nitro context
    }

    let sql;
    // Utilize Hyperdrive optimally if available in Cloudflare
    if (env.HYPERDRIVE && env.HYPERDRIVE.connectionString) {
      sql = postgres(env.HYPERDRIVE.connectionString);
    } else {
      // Robust singleton pool fallback for local development or Node scripts
      if (!localSql) {
        localSql = postgres(env.DATABASE_URL);
      }
      sql = localSql;
    }

    // Return a proxy that completely satisfies the `pg` pg.Client interface
    return {
      async query(text, params) {
        // postgres.js .unsafe() method directly supports $1 parameterization 
        const result = await sql.unsafe(text, params);
        
        // Wrap the payload format to perfectly mimic `pg` responses so no repositories break!
        return { rows: result };
      },
      release() {
        // Automatically cleanup transient isolate workers unless it's the persistent local pool
        if (sql !== localSql) {
          if (event && typeof event.waitUntil === 'function') {
             event.waitUntil(sql.end());
          } else {
             sql.end().catch(console.error);
          }
        }
      },
      // Expose the raw connection to support SQL syntax like transactions directly 
      sql
    };
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
