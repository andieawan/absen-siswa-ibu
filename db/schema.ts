import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  serial,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["guru", "admin", "superadmin", "kepsek", "bk"]);
export const jkEnum = pgEnum("jk", ["L", "P"]);
export const statusSiswaEnum = pgEnum("status_siswa", ["aktif", "pindah", "berhenti", "nonaktif", "keluar"]);
export const statusAbsenEnum = pgEnum("status_absen", ["H", "I", "S", "A"]);
export const tipeSkalaEnum = pgEnum("tipe_skala", ["angka", "huruf"]);
export const jenisUploadEnum = pgEnum("jenis_upload", ["mapel", "wali"]);

// ── Guru (3.1) ─────────────────────────────────────────
export const guru = pgTable("guru", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  nama: varchar("nama", { length: 150 }).notNull(),
  kelasWali: varchar("kelas_wali", { length: 50 }), // field assignment, BUKAN role terpisah
  salt: varchar("salt", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(), // hash lama diport apa adanya
  fotoProfilUrl: text("foto_profil_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// mapelList/kelasList/Role dulu comma-separated di 1 kolom → junction table
export const guruRole = pgTable("guru_role", {
  id: serial("id").primaryKey(),
  guruId: uuid("guru_id").notNull().references(() => guru.id),
  role: roleEnum("role").notNull(),
}, (t) => ({ unq: uniqueIndex("guru_role_unq").on(t.guruId, t.role) }));

export const guruMapel = pgTable("guru_mapel", {
  id: serial("id").primaryKey(),
  guruId: uuid("guru_id").notNull().references(() => guru.id),
  mapel: varchar("mapel", { length: 100 }).notNull(),
}, (t) => ({ unq: uniqueIndex("guru_mapel_unq").on(t.guruId, t.mapel) }));

export const guruKelas = pgTable("guru_kelas", {
  id: serial("id").primaryKey(),
  guruId: uuid("guru_id").notNull().references(() => guru.id),
  kelas: varchar("kelas", { length: 50 }).notNull(),
}, (t) => ({ unq: uniqueIndex("guru_kelas_unq").on(t.guruId, t.kelas) }));

// Pasangan Mapel-Kelas (3.5) — kalau kosong utk 1 mapel tertentu, fallback ke
// SEMUA kelas guru itu di guruKelas (BUKAN berarti tidak boleh sama sekali)
export const guruMapelKelasPairing = pgTable("guru_mapel_kelas_pairing", {
  id: serial("id").primaryKey(),
  guruId: uuid("guru_id").notNull().references(() => guru.id),
  mapel: varchar("mapel", { length: 100 }).notNull(),
  kelas: varchar("kelas", { length: 50 }).notNull(),
});

// ── Siswa (3.2) ────────────────────────────────────────
// NIS = primary key alami, VARCHAR (ada format "9733/539.111", bukan angka murni)
export const siswa = pgTable("siswa", {
  nis: varchar("nis", { length: 50 }).primaryKey(),
  nama: varchar("nama", { length: 150 }).notNull(),
  jk: jkEnum("jk").notNull(),
  kelas: varchar("kelas", { length: 50 }).notNull(),
  status: statusSiswaEnum("status").default("aktif").notNull(), // soft-delete (4.9) — JANGAN pernah DELETE baris ini
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Absensi (3.3) ──────────────────────────────────────
// Normalisasi: 1 baris = 1 siswa per tanggal per mapel (bukan NIS digabung koma)
export const absensi = pgTable("absensi", {
  id: serial("id").primaryKey(),
  nis: varchar("nis", { length: 50 }).notNull().references(() => siswa.nis),
  kelas: varchar("kelas", { length: 50 }).notNull(),
  mapel: varchar("mapel", { length: 100 }).notNull(), // konstan "Absen Harian" utk wali kelas
  tanggal: date("tanggal").notNull(),
  status: statusAbsenEnum("status").notNull(),
  guruId: uuid("guru_id").notNull().references(() => guru.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  // dipakai utk pola kunci→baca→upsert (4.1) — ON CONFLICT butuh unique ini
  unq: uniqueIndex("absensi_unq").on(t.nis, t.kelas, t.mapel, t.tanggal),
}));

// ── Nilai (3.4) ────────────────────────────────────────
export const kegiatanNilai = pgTable("kegiatan_nilai", {
  id: uuid("id").defaultRandom().primaryKey(),
  guruId: uuid("guru_id").notNull().references(() => guru.id),
  mapel: varchar("mapel", { length: 100 }).notNull(),
  kelas: varchar("kelas", { length: 50 }).notNull(),
  namaKegiatan: varchar("nama_kegiatan", { length: 150 }).notNull(),
  tanggalKegiatan: date("tanggal_kegiatan").notNull(),
  tipeSkala: tipeSkalaEnum("tipe_skala").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nilaiSiswa = pgTable("nilai_siswa", {
  id: serial("id").primaryKey(),
  kegiatanId: uuid("kegiatan_id").notNull().references(() => kegiatanNilai.id),
  nis: varchar("nis", { length: 50 }).notNull().references(() => siswa.nis),
  nilai: varchar("nilai", { length: 10 }).notNull(), // angka 0-100 atau huruf A-E, disimpan sbg text
}, (t) => ({ unq: uniqueIndex("nilai_siswa_unq").on(t.kegiatanId, t.nis) }));

// ── Audit Log (3.6) ────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  aksi: varchar("aksi", { length: 100 }).notNull(),
  modul: varchar("modul", { length: 100 }).notNull(),
  target: varchar("target", { length: 150 }),
  detail: text("detail"),
});

// ── Link Upload Absensi (3.7) ──────────────────────────
// Struktur provisional — menunggu keputusan redesain fitur (Bagian 7 poin 6)
export const linkUploadAbsensi = pgTable("link_upload_absensi", {
  token: uuid("token").defaultRandom().primaryKey(),
  jenis: jenisUploadEnum("jenis").notNull(),
  kelas: varchar("kelas", { length: 50 }).notNull(),
  mapelAtauBulan: varchar("mapel_atau_bulan", { length: 100 }),
  status: varchar("status", { length: 20 }).default("aktif").notNull(), // aktif/nonaktif/sudah_diimpor
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dibuatOleh: uuid("dibuat_oleh").notNull().references(() => guru.id),
});

// ── Delegasi Ketua Kelas (fitur #2) ────────────────────
export const ketuaKelasDelegasi = pgTable("ketua_kelas_delegasi", {
  token: uuid("token").defaultRandom().primaryKey(),
  kelas: varchar("kelas", { length: 50 }).notNull(),
  kelasWaliGuruId: uuid("kelas_wali_guru_id").notNull().references(() => guru.id),
  status: varchar("status", { length: 20 }).default("aktif").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Session (auth custom, bukan library) ───────────────
export const session = pgTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(), // token random, bukan JWT
  guruId: uuid("guru_id").notNull().references(() => guru.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
