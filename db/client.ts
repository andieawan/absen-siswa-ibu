import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Runtime query di Vercel pakai POSTGRES_URL (pooler Supabase, transaction
// mode) — env var ini otomatis di-inject setelah connect Supabase lewat
// Vercel Marketplace. prepare:false WAJIB, transaction mode tidak mendukung
// prepared statements (query akan error di production kalau lupa ini).
//
// Kalau nanti server fisik jadi target tambahan/pengganti (proses Node
// persisten), ganti connectionString ke POSTGRES_URL_NON_POOLING — kode di
// bawah ini (driver, schema, query) tidak perlu berubah sama sekali.
const connectionString = process.env.POSTGRES_URL!;

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
