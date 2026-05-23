# Windows Explorer-like App

Monorepo ini berisi:
- Backend: Bun + TypeScript + Elysia + Drizzle (PostgreSQL)
- Frontend: Bun + Vue 3 (Composition API) + Tailwind
- Shared package: tipe data bersama

## Struktur Project
- apps/backend
- apps/frontend
- packages/shared

## Prasyarat
- Bun terpasang
- PostgreSQL aktif di lokal
- Database bernama windows_explorer

## 1) Install dependency
Jalankan dari root project:

    bun install

Jika bun belum terbaca di shell, pakai:

    /Users/adnin/.bun/bin/bun install

## 2) Setup environment backend
Copy env example:

    cp apps/backend/.env.example apps/backend/.env

Lalu edit file apps/backend/.env dan sesuaikan DATABASE_URL.
Contoh umum:

    DATABASE_URL=postgres://<db_user>@localhost:5432/windows_explorer

Catatan:
- Jika role postgres tidak ada di mesin Anda, pakai user lokal PostgreSQL Anda.

## 3) Siapkan database
Buat database (sekali saja):

    createdb windows_explorer

## 4) Jalankan migrasi
Opsi A (disarankan):

    bun run db:migrate

Jika bun belum terbaca:

    /Users/adnin/.bun/bin/bun run db:migrate

Opsi B (manual SQL):

    psql -d windows_explorer -f apps/backend/drizzle/migrations/0000_init.sql

## 5) Seed data
Isi data awal folder dan file:

    bun run db:seed

Jika bun belum terbaca:

    /Users/adnin/.bun/bin/bun run db:seed

## 6) Jalankan aplikasi
Buka 2 terminal.

Terminal 1 (Backend):

    bun run dev:backend

Terminal 2 (Frontend):

    bun run dev:frontend

Jika bun belum terbaca, gunakan path absolut:

    /Users/adnin/.bun/bin/bun run dev:backend
    /Users/adnin/.bun/bin/bun run dev:frontend

## 7) Akses aplikasi
- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/health

## 8) Jalankan test
Semua test:

    bun run test

Hanya backend:

    bun run test:backend

Hanya frontend:

    bun run test:frontend

## Endpoint API utama
- GET /health
- GET /api/v1/folders?root=true
- GET /api/v1/folders/:id/children
- POST /api/v1/folders
- POST /api/v1/folders/:id/files

## Troubleshooting
1. Bun command not found
- Pakai path absolut:

    /Users/adnin/.bun/bin/bun run <script>

2. Error role postgres does not exist
- Ganti DATABASE_URL ke user PostgreSQL yang valid di mesin Anda.

3. Frontend tidak bisa ambil data
- Pastikan backend berjalan di port 3000.
- Pastikan frontend berjalan di port 5173.
