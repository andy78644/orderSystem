# 報價系統 (Quotation System)

一套簡化報價管理流程的系統，讓管理員能快速建立報價表單並收集廠商報價，提高採購決策效率。

## 📋 專案概述

本系統是根據 [PRD.md](../PRD.md) 規劃的 **Phase 1: Prototype** 實作，包含以下核心功能：

### ✨ 核心功能

#### 🔐 認證系統
- 管理員登入/登出
- Session 管理
- 路由保護

#### 📝 表單管理（管理員）
- 建立報價表單（自訂商品清單）
- 編輯表單資訊
- 刪除表單
- 開啟/關閉表單
- 複製表單
- 表單連結複製

#### 💰 報價功能
- 廠商透過公開連結填寫報價（無需登入）
- 自動計算小計與總金額
- 填寫次數限制（可設定只能填一次或允許修改）
- 報價歷史記錄

#### 📊 報價查看
- 依時間排列查看所有報價
- 依商品分組查看歷史報價
- 完整報價明細展示

## 🚀 快速開始

### 前置需求

- Node.js 18.x 或更高版本
- npm 或 yarn

### 安裝步驟

1. **安裝依賴**

```bash
npm install
```

2. **設定環境變數**

複製 `.env.example` 為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 文件（開發環境可使用預設值）：

```env
# Database - 開發階段使用 SQLite
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="dev-secret-key-please-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Admin User (預設管理員帳號)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="系統管理員"
```

3. **初始化資料庫**

```bash
# 執行 migrations
npx prisma migrate dev

# 建立預設管理員帳號
npm run db:seed
```

4. **啟動開發伺服器**

```bash
npm run dev
```

5. **開啟瀏覽器**

訪問 [http://localhost:3000](http://localhost:3000)

預設管理員帳號：
- Email: `admin@example.com`
- Password: `admin123`

## 📁 專案結構

```
quotation-system/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 認證 API
│   │   ├── forms/                # 表單管理 API
│   │   └── public/               # 公開 API（廠商用）
│   ├── forms/                    # 表單管理頁面
│   │   ├── [id]/                 # 表單詳情與編輯
│   │   ├── components/           # 共用組件
│   │   └── new/                  # 建立表單
│   ├── login/                    # 登入頁面
│   └── quote/                    # 廠商報價頁面（公開）
├── lib/                          # 工具函數
│   ├── auth.ts                   # 認證相關
│   ├── prisma.ts                 # Prisma Client
│   └── utils.ts                  # 通用工具
├── prisma/                       # Prisma 設定
│   ├── schema.prisma             # 資料庫 Schema
│   ├── migrations/               # Migration 檔案
│   └── seed.ts                   # 種子資料
└── public/                       # 靜態資源
```

## 🛠️ 技術棧

- **框架**: Next.js 16.0.1 (App Router)
- **語言**: TypeScript 5.x
- **樣式**: Tailwind CSS 4.x
- **資料庫**: SQLite (開發) / PostgreSQL (生產)
- **ORM**: Prisma 6.19.0
- **認證**: 自訂 Session 管理
- **UI**: React 19.2.0

## 📝 主要指令

```bash
# 開發
npm run dev              # 啟動開發伺服器

# 資料庫
npm run db:seed          # 建立預設管理員
npm run db:reset         # 重設資料庫
npx prisma studio        # 開啟 Prisma Studio（資料庫 GUI）

# 建置
npm run build            # 建置生產版本
npm run start            # 啟動生產伺服器

# 程式碼品質
npm run lint             # 執行 ESLint
```

## 🔑 預設帳號

系統會在首次執行 `npm run db:seed` 時自動建立管理員帳號：

- **Email**: admin@example.com
- **Password**: admin123

⚠️ **請在生產環境中變更預設密碼！**

## 📖 使用說明

### 管理員操作流程

1. **登入系統**
   - 使用管理員帳號登入

2. **建立報價表單**
   - 點選「建立新表單」
   - 填寫表單標題與廠商資訊
   - 新增商品項目（名稱、規格、數量、單位）
   - 選擇填寫模式（只能填一次/可修改）
   - 儲存表單

3. **分享表單連結**
   - 在表單列表點選「複製連結」
   - 將連結傳送給廠商

4. **查看報價**
   - 點選「查看報價」進入表單詳情頁
   - 可切換「依時間」或「依商品」檢視

5. **管理表單**
   - 編輯：修改表單內容
   - 刪除：刪除表單及所有報價記錄
   - 關閉：禁止廠商繼續填寫
   - 複製：建立類似表單

### 廠商操作流程

1. **開啟報價連結**
   - 點選管理員提供的連結

2. **填寫報價**
   - 確認廠商資訊和商品清單
   - 為每個商品填寫單價
   - 系統自動計算小計與總金額

3. **提交報價**
   - 確認無誤後點選「提交報價」
   - 若表單允許，可重新提交修改報價

## 🚢 部署建議

### 資料庫

**開發環境**: SQLite (已設定)

**生產環境**: 建議使用以下雲端 PostgreSQL 服務：
- [Supabase](https://supabase.com/) (推薦)
- [Neon](https://neon.tech/)
- [Railway](https://railway.app/)

切換步驟：
1. 修改 `prisma/schema.prisma`：
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. 更新 `.env` 中的 `DATABASE_URL`

3. 執行 migration：
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

### 部署平台

推薦使用 [Vercel](https://vercel.com/)：
1. 連接 GitHub repository
2. 設定環境變數
3. 自動部署

## 🔄 從 Prototype 升級到完整產品

參考 [PRD.md](../PRD.md) 的 **Phase 2** 規劃，未來可新增：

- 📊 進階統計分析（圖表、最低價、平均價）
- 📄 報表匯出（Excel / PDF）
- 👥 多用戶權限管理
- 🔒 資料加密與備份
- 📱 通知系統（LINE / Email）

## 🐛 已知問題

- SQLite 不支援 Decimal 類型，使用 Float 可能有精度問題（建議生產環境切換至 PostgreSQL）
- 廠商報價頁面的「複製連結」功能需要在客戶端執行

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 聯絡資訊

如有問題請聯繫專案負責人。
