-- PostgreSQL Seed SQL for Supabase
-- 在 Supabase SQL Editor 中執行此 SQL 來創建管理員帳號

-- 安裝 pgcrypto extension（用於生成 UUID）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 創建管理員帳號
-- Email: admin@example.com
-- Password: admin123
INSERT INTO "users" ("id", "email", "password_hash", "name", "created_at")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2b$10$PtIWlN3G27x6YtuU6SDUdurOWW3BG4QhVKj.A7bW2wGhJZ8htLtfO',
  '系統管理員',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- 驗證是否成功創建
SELECT
    email,
    name,
    created_at
FROM "users"
WHERE email = 'admin@example.com';
