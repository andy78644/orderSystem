# Vercel Postgres 部署指南

如果您在 Vercel 上使用 Vercel Postgres，請遵循此指南。

## ✨ 為什麼選擇 Vercel Postgres？

- ✅ 與 Vercel 原生整合
- ✅ 自動配置環境變數
- ✅ 免費方案（60 小時計算時間/月）
- ✅ 自動連接池管理
- ✅ 無需手動配置網路

## 🚀 快速開始

### 步驟 1: 創建 Vercel Postgres 資料庫

1. **前往 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **創建 Storage**
   - 點擊 "Storage" 標籤
   - 點擊 "Create Database"
   - 選擇 "Postgres"
   - 選擇區域（建議選擇離您最近的）
   - 點擊 "Create"

3. **連接到專案**
   - 資料庫創建後，點擊 "Connect Project"
   - 選擇您的 quotation-system 專案
   - 點擊 "Connect"

✅ **完成！** Vercel 會自動設定以下環境變數：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 步驟 2: 設定其他環境變數

在 Vercel Dashboard → Your Project → Settings → Environment Variables 添加：

```env
# NextAuth Secret（生成隨機密鑰）
NEXTAUTH_SECRET=your-random-secret-key-here

# Application URL（部署後的 URL）
NEXTAUTH_URL=https://your-app.vercel.app

# Admin User（管理員帳號）
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=系統管理員
```

### 步驟 3: 部署專案

1. **推送代碼到 GitHub**（如果還沒有）
   ```bash
   git push origin your-branch
   ```

2. **在 Vercel 上部署**
   - Vercel 會自動檢測到推送並開始部署
   - 或手動觸發：Dashboard → Deployments → Redeploy

3. **等待部署完成**（約 2-3 分鐘）

### 步驟 4: 初始化資料庫

**重要**：部署完成後，需要執行資料庫遷移。

#### 方法 A: 使用本地終端（推薦）

```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 登入
vercel login

# 3. 進入專案目錄
cd quotation-system

# 4. 連結到 Vercel 專案
vercel link

# 5. 拉取環境變數
vercel env pull .env.vercel

# 6. 執行遷移
npx dotenv -e .env.vercel -- npx prisma migrate deploy

# 7. 創建管理員
npx dotenv -e .env.vercel -- npm run db:seed
```

#### 方法 B: 使用 Vercel Postgres Dashboard（手動）

如果上述方法不可行，可以手動執行 SQL：

1. **前往 Vercel Dashboard**
   - Storage → 您的 Postgres 資料庫
   - 點擊 "Query" 標籤

2. **執行遷移 SQL**
   - 複製 `supabase_migration.sql` 的內容
   - 貼到 Query editor
   - 點擊 "Run"

3. **創建管理員**
   - 複製 `supabase_seed.sql` 的內容
   - 貼到 Query editor
   - 點擊 "Run"

### 步驟 5: 測試部署

1. 訪問您的部署 URL
2. 使用管理員帳號登入
3. 建立測試表單
4. 測試廠商報價功能

---

## 🔧 Vercel Postgres 環境變數說明

Vercel Postgres 自動提供三個主要環境變數：

### 1. `POSTGRES_PRISMA_URL`
- **用途**: Prisma Client 在應用運行時使用
- **特性**: 使用 PgBouncer 連接池
- **格式**: `postgresql://user:pass@host/db?pgbouncer=true&connect_timeout=15`

### 2. `POSTGRES_URL_NON_POOLING`
- **用途**: Prisma Migrate 執行遷移時使用
- **特性**: 直接連接，不使用連接池
- **格式**: `postgresql://user:pass@host/db`

### 3. `POSTGRES_URL`
- **用途**: 一般應用查詢（非 Prisma）
- **特性**: 使用連接池
- **格式**: `postgresql://user:pass@host/db?pgbouncer=true`

我們的 Prisma schema 已配置為使用 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`。

---

## 📊 與其他資料庫服務的對比

| 特性 | Vercel Postgres | Supabase | Neon |
|------|----------------|----------|------|
| 自動配置 | ✅ 是 | ❌ 手動 | ❌ 手動 |
| 免費方案 | 60 小時/月 | 500MB | 0.5GB |
| 環境變數 | 自動設定 | 需手動設定 | 需手動設定 |
| IPv6 要求 | ❌ 否 | ✅ 是（Direct） | ✅ 是 |
| 連接池 | 自動 | 可選 | 可選 |
| 與 Vercel 整合 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## ⚠️ 重要注意事項

### 1. 環境變數名稱
- ✅ 使用 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`
- ❌ **不要**使用 `DATABASE_URL`（除非您使用其他服務）

### 2. 連接限制
- Vercel Postgres 免費方案有連接限制
- 使用連接池可以優化性能

### 3. 遷移執行
- 始終使用 `POSTGRES_URL_NON_POOLING` 執行遷移
- 使用 `POSTGRES_PRISMA_URL` 運行應用

### 4. 計費
- 免費方案：60 小時計算時間/月
- 超過後按量計費
- 監控使用情況：Dashboard → Storage → Usage

---

## 🔄 從其他資料庫服務遷移到 Vercel Postgres

如果您之前使用 Supabase 或其他服務：

### 步驟 1: 創建 Vercel Postgres
按照上述「步驟 1」操作

### 步驟 2: 導出舊資料庫（可選）
```bash
# 從 Supabase 導出
pg_dump "postgresql://..." > backup.sql

# 導入到 Vercel Postgres
psql "$(cat .env.vercel | grep POSTGRES_URL_NON_POOLING)" < backup.sql
```

### 步驟 3: 更新環境變數
- 刪除舊的 `DATABASE_URL`
- Vercel Postgres 環境變數已自動設定

### 步驟 4: 重新部署
```bash
vercel --prod
```

---

## 🆘 故障排除

### 問題：遷移卡住或超時

**原因**：使用了連接池 URL

**解決**：確保使用 `POSTGRES_URL_NON_POOLING`
```bash
npx dotenv -e .env.vercel -- npx prisma migrate deploy
```

### 問題：連接數過多

**原因**：超過免費方案的連接限制

**解決**：
1. 檢查 Dashboard → Storage → Usage
2. 優化查詢，減少並發連接
3. 考慮升級到付費方案

### 問題：環境變數未找到

**原因**：資料庫未連接到專案

**解決**：
1. Dashboard → Storage → 您的資料庫
2. 點擊 "Connect Project"
3. 選擇正確的專案
4. 重新部署

---

## 📚 相關資源

- [Vercel Postgres 文檔](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel CLI 文檔](https://vercel.com/docs/cli)

---

## ✅ 部署檢查清單

- [ ] Vercel Postgres 資料庫已創建
- [ ] 資料庫已連接到專案
- [ ] 環境變數自動設定（POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING）
- [ ] 其他環境變數已手動設定（NEXTAUTH_SECRET, ADMIN_EMAIL, etc.）
- [ ] 專案已部署到 Vercel
- [ ] 資料庫遷移已執行
- [ ] 管理員帳號已創建
- [ ] 能夠成功登入
- [ ] 功能測試完成

恭喜！您已成功在 Vercel 上部署報價系統！🎉
