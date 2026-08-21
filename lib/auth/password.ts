import { createHash } from "node:crypto";

// !! GANTI SEBELUM DIPAKAI !!
// Ini asumsi urutan salt+SHA256 yang PALING UMUM (salt + password, di-hash
// sekali). Briefing migrasi tidak menyebutkan urutan concat persis dari
// Auth.gs asli — cek source Auth.gs yang sebenarnya sebelum pakai fungsi ini,
// kalau urutannya beda (password+salt, atau di-hash 2x), SEMUA akun guru
// lama akan gagal login meski password benar.
export function verifyLegacyPassword(password: string, salt: string, hash: string): boolean {
  const computed = createHash("sha256").update(salt + password).digest("hex");
  return computed === hash;
}
