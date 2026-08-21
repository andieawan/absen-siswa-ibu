// Wajib jalan di Node.js runtime (pakai node:crypto) — jangan dipanggil dari
// route/middleware yang di-set ke Edge Runtime.
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { session as sessionTable } from "@/db/schema";

const SESSION_COOKIE = "session_id";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 hari

// Domain SSO lintas subdomain, dipakai bersama app BK (lihat briefing 2.14).
// Harus persis sama dengan yang dipakai ssocookie.js di GAS lama.
const COOKIE_DOMAIN = ".smkibupakusari.sch.id";

export async function createSession(guruId: string) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessionTable).values({ id, guruId, expiresAt });

  (await cookies()).set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    domain: COOKIE_DOMAIN,
    expires: expiresAt,
    path: "/",
  });

  return id;
}

export async function getSession() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;

  const [row] = await db.select().from(sessionTable).where(eq(sessionTable.id, id));
  if (!row || row.expiresAt < new Date()) return null;

  return row;
}

export async function destroySession() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (id) await db.delete(sessionTable).where(eq(sessionTable.id, id));
  (await cookies()).delete(SESSION_COOKIE);
}
