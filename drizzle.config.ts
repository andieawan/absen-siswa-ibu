import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrasi WAJIB lewat direct connection, bukan pooler transaction-mode
  // (transaction mode tidak mendukung sebagian operasi DDL/session).
  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING!,
  },
});
