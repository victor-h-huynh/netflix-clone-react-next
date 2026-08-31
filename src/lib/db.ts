// src/lib/db.ts
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL. Add your Neon connection string to .env.local. " +
      "Get it from the Neon dashboard -> Connection Details -> enable " +
      "Connection pooling -> copy the connection string.",
  );
}

// Neon's pooled endpoint runs PgBouncer in transaction mode, which does not
// support session-level prepared statements — so `prepare: false`. `max: 1`
// keeps each serverless invocation to a single connection. SSL is taken from
// `?sslmode=require` in the connection string.
export const sql = postgres(connectionString, { max: 1, prepare: false });
