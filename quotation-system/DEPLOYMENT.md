# 報價系統部署指南

本指南將協助您將報價系統部署到 Vercel 供他人測試。

## 📋 部署前準備

### 1. 準備 PostgreSQL 數據庫

您需要一個 PostgreSQL 數據庫。推薦使用以下免費方案之一：

#### 選項 A: Vercel Postgres（推薦）
1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Storage" → "Create Database"
3. 選擇 "Postgres"
4. 記下連接字串（DATABASE_URL）

#### 選項 B: Supabase
1. 前往 [Supabase](https://supabase.com/)
2. 創建新專案
3. 在 Settings → Database 找到連接字串
4. 格式：`postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres`

#### 選項 C: Neon
1. 前往 [Neon](https://neon.tech/)
2. 創建新專案
3. 複製連接字串

### 2. 準備環境變數

您需要設定以下環境變數：

```env
# 數據庫連接（從上一步獲得）
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# 認證密鑰（隨機生成，保持秘密）
NEXTAUTH_SECRET="your-random-secret-key-change-this"

# 部署 URL（稍後 Vercel 會提供）
NEXTAUTH_URL="https://your-app.vercel.app"

# 管理員帳號（首次部署會自動創建）
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="系統管理員"
```

## 🚀 部署步驟

### 方法 1: 通過 Vercel Dashboard 部署（推薦）

#### 步驟 1: 連接 GitHub 倉庫到 Vercel

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New..." → "Project"
3. 選擇您的 GitHub 倉庫（`orderSystem`）
4. 點擊 "Import"

#### 步驟 2: 配置專案

1. **Project Name**: 自訂專案名稱（例如：`quotation-system-prototype`）

2. **Framework Preset**: 自動檢測為 "Next.js"

3. **Root Directory**: 點擊 "Edit" → 輸入 `quotation-system`

4. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Environment Variables**: 點擊 "Environment Variables" 添加以下變數：
   ```
   DATABASE_URL = postgresql://your-connection-string
   NEXTAUTH_SECRET = your-random-secret
   NEXTAUTH_URL = https://your-app.vercel.app (暫時留空，部署後再更新)
   ADMIN_EMAIL = admin@example.com
   ADMIN_PASSWORD = your-secure-password
   ADMIN_NAME = 系統管理員
   ```

#### 步驟 3: 選擇分支並部署

1. **Git Branch**: 選擇 `claude/quotation-system-prototype-011CUs1uvjdsRichmWxsVxcN`

2. 點擊 "Deploy"

3. 等待部署完成（約 2-3 分鐘）

#### 步驟 4: 初始化數據庫

部署完成後，您需要初始化數據庫：

1. 前往 Vercel 專案的 "Settings" → "Functions"
2. 找到 "Environment Variables"
3. 確認 `DATABASE_URL` 已正確設定
4. 前往專案 URL（例如：`https://quotation-system-prototype.vercel.app`）
5. 系統會自動執行資料庫遷移和種子資料

**或者使用 Vercel CLI**:
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 連接到專案
vercel link

# 執行資料庫遷移
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

#### 步驟 5: 更新 NEXTAUTH_URL

1. 複製部署後的 URL（例如：`https://quotation-system-prototype.vercel.app`）
2. 前往 Vercel 專案的 "Settings" → "Environment Variables"
3. 更新 `NEXTAUTH_URL` 為您的部署 URL
4. 觸發重新部署（Deployments → 最新部署 → "Redeploy"）

### 方法 2: 通過 Vercel CLI 部署

```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 切換到專案目錄
cd quotation-system

# 3. 登入 Vercel
vercel login

# 4. 部署
vercel

# 5. 按照提示操作，設定環境變數

# 6. 部署到生產環境
vercel --prod
```

## 🔧 部署後設定

### 1. 資料庫遷移（重要！）

如果是首次部署，需要執行資料庫遷移：

```bash
# 在本地執行（連接到生產數據庫）
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
DATABASE_URL="your-production-db-url" npx prisma db seed
```

### 2. 測試管理員登入

1. 前往部署的 URL
2. 使用環境變數中設定的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 登入
3. 確認系統正常運作

### 3. 創建測試表單

1. 登入後創建一張測試表單
2. 複製公開連結
3. 在無痕模式中打開連結測試廠商報價功能

## 📱 分享給測試者

部署完成後，您可以分享：

### 管理員測試
```
URL: https://your-app.vercel.app
帳號: admin@example.com
密碼: admin123
```

### 廠商報價測試
1. 以管理員身份登入
2. 創建測試表單
3. 複製公開報價連結
4. 分享連結給測試者（無需登入即可填寫報價）

## 🔍 常見問題

### Q1: 部署失敗，顯示 "Module not found: Can't resolve 'prisma'"

**解決方案**: 確保 `package.json` 中的 `postinstall` 腳本已添加：
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Q2: 無法連接數據庫

**解決方案**:
- 檢查 `DATABASE_URL` 格式是否正確
- 確認數據庫允許外部連接（檢查防火牆設定）
- Vercel Postgres: 確保使用 "External" 連接字串

### Q3: 登入後顯示 "Unauthorized"

**解決方案**:
- 確認 `NEXTAUTH_SECRET` 已設定
- 確認資料庫遷移已執行
- 檢查管理員帳號是否已創建（執行 seed 腳本）

### Q4: 如何查看部署日誌？

前往 Vercel Dashboard → 您的專案 → Deployments → 點擊最新部署 → "View Function Logs"

### Q5: 如何更新部署？

當您推送新的 commit 到 GitHub 分支時，Vercel 會自動重新部署。

或手動觸發：
1. Vercel Dashboard → 專案 → Deployments
2. 選擇最新部署 → "Redeploy"

## 🎯 部署檢查清單

- [ ] PostgreSQL 數據庫已創建
- [ ] 所有環境變數已設定
- [ ] Vercel 專案已連接到正確的 GitHub 倉庫和分支
- [ ] Root Directory 設定為 `quotation-system`
- [ ] 首次部署成功
- [ ] 資料庫遷移已執行
- [ ] 種子資料已載入（管理員帳號）
- [ ] `NEXTAUTH_URL` 已更新為實際部署 URL
- [ ] 管理員登入測試成功
- [ ] 建立測試表單成功
- [ ] 公開報價連結可正常訪問
- [ ] 廠商報價提交測試成功
- [ ] 比較功能測試成功

## 📞 技術支援

如遇到其他問題，請檢查：
- [Vercel 文檔](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Prisma 部署文檔](https://www.prisma.io/docs/guides/deployment)

---

部署完成後，您可以將部署 URL 和測試帳號分享給測試者使用！🎉
