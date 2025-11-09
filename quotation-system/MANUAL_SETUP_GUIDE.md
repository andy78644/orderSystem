# 手動設定 Supabase 資料庫指南

如果您的網路環境不支援 IPv6，無法使用 Direct Connection 執行 Prisma migrate，請使用此手動方法。

## 🎯 方法：使用 Supabase SQL Editor

這個方法完全不依賴本地網路連接，直接在 Supabase 網頁介面操作。

---

## 步驟 1: 執行資料庫遷移

### 1.1 開啟 SQL Editor

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 點擊左側選單的 **"SQL Editor"** 圖示
4. 點擊右上角的 **"New query"** 按鈕

### 1.2 執行遷移 SQL

複製以下 SQL 並貼到 SQL Editor：

```sql
-- PostgreSQL Migration SQL for Supabase
-- 建立所有資料表

-- CreateTable: users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: forms
CREATE TABLE IF NOT EXISTS "forms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "vendor_phone" TEXT NOT NULL,
    "vendor_email" TEXT NOT NULL,
    "allow_multiple_submissions" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable: form_items
CREATE TABLE IF NOT EXISTS "form_items" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "form_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quotations
CREATE TABLE IF NOT EXISTS "quotations" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "total_amount" DOUBLE PRECISION,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quotation_items
CREATE TABLE IF NOT EXISTS "quotation_items" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "form_item_id" TEXT NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "forms_created_by_idx" ON "forms"("created_by");
CREATE INDEX IF NOT EXISTS "form_items_form_id_idx" ON "form_items"("form_id");
CREATE INDEX IF NOT EXISTS "quotations_form_id_idx" ON "quotations"("form_id");
CREATE INDEX IF NOT EXISTS "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");

-- AddForeignKey
ALTER TABLE "forms"
ADD CONSTRAINT "forms_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "form_items"
ADD CONSTRAINT "form_items_form_id_fkey"
FOREIGN KEY ("form_id") REFERENCES "forms"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quotations"
ADD CONSTRAINT "quotations_form_id_fkey"
FOREIGN KEY ("form_id") REFERENCES "forms"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quotation_items"
ADD CONSTRAINT "quotation_items_quotation_id_fkey"
FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quotation_items"
ADD CONSTRAINT "quotation_items_form_item_id_fkey"
FOREIGN KEY ("form_item_id") REFERENCES "form_items"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
VALUES (
    '20251106180045_init',
    'migration_checksum',
    '20251106180045_init',
    CURRENT_TIMESTAMP,
    1
) ON CONFLICT DO NOTHING;
```

### 1.3 執行 SQL

1. 確認 SQL 已完整貼入
2. 點擊右下角的 **"Run"** 按鈕（或按 `Ctrl+Enter`）
3. 等待執行完成（約 5-10 秒）

### 1.4 確認結果

執行成功會顯示：
```
Success. No rows returned
```

如果有錯誤，請檢查：
- SQL 是否完整複製
- 是否有其他查詢同時執行
- 重新執行一次（SQL 使用了 `IF NOT EXISTS`，可安全重複執行）

---

## 步驟 2: 創建管理員帳號

### 2.1 開啟新的查詢

1. 在 SQL Editor 中點擊 **"New query"**
2. 或清空當前的 SQL 編輯器

### 2.2 執行 Seed SQL

複製以下 SQL 並貼到 SQL Editor：

```sql
-- 創建管理員帳號
-- Email: admin@example.com
-- Password: admin123

-- 安裝 pgcrypto extension（用於生成 UUID）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 插入管理員資料
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
    id,
    email,
    name,
    created_at
FROM "users"
WHERE email = 'admin@example.com';
```

### 2.3 執行並驗證

1. 點擊 **"Run"**
2. 應該會看到返回一行資料：

```
id: xxx-xxx-xxx
email: admin@example.com
name: 系統管理員
created_at: 2025-11-08 ...
```

如果顯示 `No rows returned`，表示管理員已經存在（SQL 使用了 `ON CONFLICT DO NOTHING`）。

---

## 步驟 3: 驗證資料庫設定

### 3.1 使用 Table Editor 檢查

1. 點擊左側選單的 **"Table Editor"** 圖示
2. 確認可以看到以下 5 個表格：
   - ✅ users
   - ✅ forms
   - ✅ form_items
   - ✅ quotations
   - ✅ quotation_items

3. 點擊 **"users"** 表
4. 確認有一筆資料：
   - email: `admin@example.com`
   - name: `系統管理員`

### 3.2 測試登入

1. 前往您的部署 URL（Vercel）
2. 使用以下帳號登入：
   - **Email**: `admin@example.com`
   - **Password**: `admin123`

3. 如果能成功登入，表示資料庫設定完成！🎉

---

## 🔧 自訂管理員帳號（選填）

如果您想使用不同的 email 或密碼：

### 方法 A: 修改 SQL

在步驟 2.2 的 SQL 中修改：

```sql
-- 修改這兩行
'your-email@example.com',  -- 改成您的 email
'$2b$10$...',              -- 改成您的密碼 hash
```

### 方法 B: 生成密碼 Hash

在本地終端執行（需要 Node.js）：

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
```

將輸出的 hash 替換到 SQL 中。

---

## ✅ 完成檢查清單

完成以下檢查，確保設定正確：

- [ ] Supabase SQL Editor 執行遷移 SQL 成功
- [ ] Table Editor 中看到 5 個表格
- [ ] 執行 Seed SQL 成功
- [ ] users 表中有管理員資料
- [ ] 能夠成功登入應用
- [ ] 能夠建立測試表單
- [ ] 能夠複製公開連結
- [ ] 廠商能夠提交報價

---

## 🆘 故障排除

### 問題：執行 SQL 時出現 "syntax error"

**解決方案**：
1. 確認完整複製了 SQL（包含所有行）
2. 確認沒有額外的字元或空格
3. 分段執行（先執行 CREATE TABLE，再執行 CREATE INDEX，最後 ALTER TABLE）

### 問題：無法創建管理員（email already exists）

**解決方案**：
這表示管理員已經存在，可以直接使用。或者：

```sql
-- 刪除現有管理員（小心使用！）
DELETE FROM "users" WHERE email = 'admin@example.com';

-- 重新執行 seed SQL
```

### 問題：登入時顯示 "Invalid credentials"

**可能原因**：
1. 密碼 hash 不正確
2. Email 不正確

**解決方案**：
```sql
-- 檢查管理員資料
SELECT email, password_hash FROM "users" WHERE email = 'admin@example.com';

-- 如果需要，重置密碼
UPDATE "users"
SET password_hash = '$2b$10$PtIWlN3G27x6YtuU6SDUdurOWW3BG4QhVKj.A7bW2wGhJZ8htLtfO'
WHERE email = 'admin@example.com';
```

---

## 📞 需要幫助？

如果遇到其他問題：

1. **檢查 Supabase Logs**
   - Dashboard → Logs → 查看 Postgres Logs

2. **重新執行**
   - 所有 SQL 都使用了 `IF NOT EXISTS` 或 `ON CONFLICT`
   - 可以安全地重複執行

3. **聯繫支援**
   - 提供錯誤訊息截圖
   - 說明執行到哪一步驟

---

恭喜！您已經成功手動設定了 Supabase 資料庫！🎉

下一步：開始使用系統建立報價表單並測試功能。
