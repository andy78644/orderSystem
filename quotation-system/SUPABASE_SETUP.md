# 使用 Supabase 初始化資料庫指南

## 📋 前置準備

1. **創建 Supabase 專案**（如果還沒有）
   - 前往 https://supabase.com/
   - 登入並創建新專案
   - 等待專案初始化完成（約 1-2 分鐘）

2. **獲取資料庫連接字串**

   在 Supabase Dashboard：
   - 點擊左側的 "Project Settings" ⚙️
   - 選擇 "Database"
   - 找到 "Connection string" 區塊
   - 選擇 "URI" 格式
   - **重要**：選擇 "Session mode" 或 "Transaction mode"（推薦 Transaction mode）
   - 複製連接字串，格式類似：
     ```
     postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
     ```
   - 將 `[YOUR-PASSWORD]` 替換為您創建專案時設定的密碼

## 🚀 初始化步驟

### 方法 1: 使用本地終端機（推薦）

#### 步驟 1: 設定環境變數

在專案目錄下創建 `.env.production` 文件：

```bash
cd quotation-system
```

創建文件並添加 Supabase 連接字串：

```env
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:YOUR-PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

#### 步驟 2: 執行資料庫遷移

```bash
# 載入環境變數並執行遷移
npx dotenv -e .env.production -- npx prisma migrate deploy
```

或直接使用：

```bash
DATABASE_URL="your-supabase-connection-string" npx prisma migrate deploy
```

您應該會看到類似這樣的輸出：
```
Prisma Migrate applied the following migration(s):

migrations/
  └─ 20251106180045_init/
    └─ migration.sql

All migrations have been successfully applied.
```

#### 步驟 3: 執行種子資料（創建管理員帳號）

```bash
# 載入環境變數並執行 seed
npx dotenv -e .env.production -- npx prisma db seed
```

或：

```bash
DATABASE_URL="your-supabase-connection-string" npm run db:seed
```

您應該會看到：
```
Running seed command `tsx prisma/seed.ts` ...
Admin user created successfully!
Email: admin@example.com
Password: admin123

🌱  The seed command has been executed.
```

### 方法 2: 使用 Supabase SQL Editor（手動方式）

如果上述方法遇到問題，可以手動執行 SQL：

#### 步驟 1: 開啟 SQL Editor

1. 在 Supabase Dashboard 點擊左側的 "SQL Editor"
2. 點擊 "New query"

#### 步驟 2: 執行遷移 SQL

複製並執行以下 SQL（從遷移文件中）：

```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "vendor_phone" TEXT NOT NULL,
    "vendor_email" TEXT NOT NULL,
    "allow_multiple_submissions" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_items" (
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

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "total_amount" DOUBLE PRECISION,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "forms_created_by_idx" ON "forms"("created_by");

-- CreateIndex
CREATE INDEX "form_items_form_id_idx" ON "form_items"("form_id");

-- CreateIndex
CREATE INDEX "quotations_form_id_idx" ON "quotations"("form_id");

-- CreateIndex
CREATE INDEX "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_items" ADD CONSTRAINT "form_items_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_form_item_id_fkey" FOREIGN KEY ("form_item_id") REFERENCES "form_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

點擊 "Run" 執行。

#### 步驟 3: 創建管理員帳號

執行以下 SQL（記得修改 email 和 password）：

```sql
-- 首先需要安裝 pgcrypto extension（用於生成 UUID）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 創建管理員帳號
-- 注意：這裡的密碼 hash 是 "admin123" 的 bcrypt hash
-- 如果要用其他密碼，需要先在本地生成 bcrypt hash
INSERT INTO "users" ("id", "email", "password_hash", "name", "created_at")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2a$10$YourBcryptHashHere',  -- 需要替換成實際的 bcrypt hash
  '系統管理員',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;
```

**生成密碼 hash**：

在本地終端執行：

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

將輸出的 hash 替換到上面 SQL 中的 `$2a$10$YourBcryptHashHere`。

### 方法 3: 使用 npm 套件（最簡單）

如果安裝了 `dotenv-cli`：

```bash
# 安裝 dotenv-cli
npm install -g dotenv-cli

# 或在專案中安裝
npm install --save-dev dotenv-cli

# 執行遷移
dotenv -e .env.production -- npx prisma migrate deploy

# 執行 seed
dotenv -e .env.production -- npm run db:seed
```

## ✅ 驗證資料庫初始化

### 1. 使用 Prisma Studio 檢查

```bash
DATABASE_URL="your-supabase-connection-string" npx prisma studio
```

打開瀏覽器訪問 http://localhost:5555，檢查：
- `users` 表中是否有管理員帳號
- 所有表是否都已創建

### 2. 使用 Supabase Table Editor

1. 在 Supabase Dashboard 點擊 "Table Editor"
2. 檢查是否看到以下表格：
   - users
   - forms
   - form_items
   - quotations
   - quotation_items
3. 點擊 `users` 表，確認管理員帳號是否存在

### 3. 測試登入

1. 訪問您的部署 URL
2. 使用管理員帳號登入：
   - Email: `admin@example.com`
   - Password: `admin123`（或您設定的密碼）
3. 如果能成功登入，表示資料庫初始化成功！

## 🔧 常見問題

### Q1: 執行 migrate 時出現 "P3009: migrate found failed migrations"

**解決方案**：
```bash
# 重置遷移狀態
DATABASE_URL="your-connection-string" npx prisma migrate resolve --rolled-back 20251106180045_init

# 重新執行
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

### Q2: 連接字串錯誤 "Can't reach database server"

**檢查項目**：
1. 確認使用的是 **Transaction mode** 連接字串（端口通常是 6543）
2. 確認密碼正確（沒有特殊字元需要 URL encode）
3. 確認 Supabase 專案狀態是 "Active"
4. 檢查網路連接

**特殊字元處理**：
如果密碼包含特殊字元，需要 URL encode：
```
@ → %40
# → %23
$ → %24
& → %26
```

### Q3: seed 執行失敗 "bcrypt is not defined"

**解決方案**：
```bash
# 確保已安裝 bcryptjs
npm install bcryptjs
npm install --save-dev @types/bcryptjs

# 重新執行
DATABASE_URL="your-connection-string" npm run db:seed
```

### Q4: "relation 'users' does not exist"

**原因**：遷移未成功執行

**解決方案**：
1. 檢查 Supabase Table Editor，確認表格是否存在
2. 如果不存在，重新執行遷移
3. 或使用手動 SQL 方式（方法 2）

## 📞 需要幫助？

如果遇到其他問題：

1. **檢查 Supabase Logs**
   - Dashboard → Logs → 查看 Postgres Logs

2. **檢查 Prisma 日誌**
   ```bash
   DEBUG="*" DATABASE_URL="your-connection-string" npx prisma migrate deploy
   ```

3. **連接測試**
   ```bash
   DATABASE_URL="your-connection-string" npx prisma db pull
   ```
   如果成功，說明連接正常。

## 🎯 快速檢查清單

- [ ] Supabase 專案已創建
- [ ] 已獲取正確的連接字串（Transaction mode）
- [ ] 密碼已替換到連接字串中
- [ ] `npx prisma migrate deploy` 執行成功
- [ ] `npm run db:seed` 執行成功
- [ ] Supabase Table Editor 中看到所有表格
- [ ] `users` 表中有管理員帳號
- [ ] 能夠成功登入應用

完成以上步驟後，您的 Supabase 資料庫就初始化完成了！🎉
