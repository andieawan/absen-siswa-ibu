This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Setup database (Drizzle + Supabase)
```bash
npm install
vercel link
vercel env pull .env.local
npm run db:push   # push schema ke Supabase, pakai POSTGRES_URL_NON_POOLING
npm run dev
```

**Cek dulu sebelum pakai auth**: `lib/auth/password.ts` masih placeholder —
urutan concat salt+SHA256 belum dicocokkan ke `Auth.gs` asli. Kalau beda,
semua akun guru lama gagal login walau password benar.

**Catatan**: `AGENTS.md`/`CLAUDE.md` di repo ini sah — `node_modules/next/dist/docs/`
memang berisi dokumentasi resmi Next.js versi yang ter-install (sudah
diverifikasi langsung dari paket npm). Baca folder itu kalau butuh referensi
API yang persis cocok dengan versi Next.js yang dipakai project ini.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
