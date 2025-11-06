# 報價系統 PRD (Product Requirements Document)

## 📋 目錄
1. [專案概述](#1-專案概述)
2. [Phase 1: Prototype 需求](#2-phase-1-prototype-需求)
3. [Phase 2: 完整產品需求](#3-phase-2-完整產品需求)
4. [系統架構建議](#4-系統架構建議)
5. [非功能需求](#5-非功能需求)
6. [開發優先序](#6-開發優先序)
7. [驗收與交付](#7-驗收與交付)

---

## 1. 專案概述

### 1.1 目標
建立一套簡化報價管理流程的系統，讓管理員能快速建立報價表單並收集廠商報價，提高採購決策效率。

### 1.2 核心價值
- **簡化流程**：管理員預先設定廠商資訊，廠商無需註冊即可填寫報價
- **靈活彈性**：每張表單可自訂商品項目，不依賴固定商品主檔
- **歷史追蹤**：完整記錄報價歷史，便於比較分析

### 1.3 開發階段
- **Phase 1: Prototype** - 驗證核心流程可行性
- **Phase 2: 完整產品** - 完善功能與系統穩定性

### 1.4 技術架構原則
- 使用雲端服務部署（如 Vercel、Railway、Render 等）
- 簡單架構設計，避免過度複雜的雲端服務依賴
- 優先考慮開發效率與維護便利性

---

## 2. Phase 1: Prototype 需求

### 需求 P1-1：管理員表單建立

**用戶故事**：作為管理員，我希望能建立報價表單並指定廠商資訊，以便向特定廠商收集報價。

**驗收標準**：
- WHEN 管理員登入系統 THEN 系統 SHALL 顯示表單管理介面
- WHEN 管理員建立新表單 THEN 系統 SHALL 允許輸入：
  - 表單標題
  - 廠商資訊（公司名稱、電話、Email）
  - 商品清單（每項商品包含：商品名稱、規格描述、數量、單位）
  - 填寫模式（只能填一次/可修改，**預設為只能填一次**）
- WHEN 管理員新增商品項目 THEN 系統 SHALL 允許自訂商品資訊（不依賴商品主檔）
  - 範例：「手套 每打」、「口罩 50個」
- WHEN 管理員儲存表單 THEN 系統 SHALL：
  - 生成唯一的表單連結（UUID 或隨機字串）
  - 記錄建立時間和建立者資訊
  - 顯示生成的連結供複製
  - 顯示儲存成功訊息

**優先級**：P0（最高）

---

### 需求 P1-2：廠商報價填寫

**用戶故事**：作為廠商，我希望透過連結快速填寫報價，無需註冊或登入。

**驗收標準**：
- WHEN 廠商開啟表單連結 THEN 系統 SHALL：
  - 顯示表單標題
  - 顯示廠商資訊（由管理員預先填寫，**廠商無需再填**）
  - 顯示完整商品清單（名稱、規格、數量、單位）
- WHEN 廠商填寫報價 THEN 系統 SHALL：
  - 允許為每個商品輸入單價（數字欄位）
  - 自動計算小計（單價 × 數量）
  - 顯示總計金額
- WHEN 廠商提交報價 THEN 系統 SHALL：
  - 驗證所有商品單價已填寫
  - 驗證數字格式正確性
  - 記錄提交時間
  - 顯示提交成功訊息
- IF 表單設定為「只能填一次」且已提交 THEN 系統 SHALL：
  - 顯示「此表單已提交」訊息
  - 禁止再次填寫和修改
  - 顯示已提交的報價內容（唯讀）
- IF 表單設定為「可修改」THEN 系統 SHALL：
  - 允許廠商重新開啟連結
  - 顯示上次填寫的內容
  - 允許修改並重新提交
  - 記錄為新版本（保留歷史記錄）

**優先級**：P0（最高）

---

### 需求 P1-3：報價查看與歷史記錄

**用戶故事**：作為管理員，我希望查看所有廠商報價並比較歷史記錄，以便做出採購決策。

**驗收標準**：
- WHEN 管理員查看表單詳情 THEN 系統 SHALL 顯示：
  - 表單基本資訊（標題、廠商名稱、建立時間）
  - 所有已提交的報價版本
  - 每筆報價的提交時間
  - 各商品的單價、小計和總計
- WHEN 管理員查看報價歷史 THEN 系統 SHALL：
  - **依商品分組顯示**（例如：「手套 每打」的所有歷史報價）
  - 列出該商品所有時間點的報價數字（時間、單價、小計）
  - 標示最新報價（視覺標記）
  - 依時間順序排列（最新在上）
- WHEN 查看同一廠商多次提交記錄 THEN 系統 SHALL：
  - 依時間順序列出所有版本
  - 清楚標示版本號或提交時間
  - 可展開查看每個版本的詳細內容
- WHEN 系統顯示報價資訊 THEN 系統 SHALL：
  - 清楚顯示單位（如「元/打」、「元/50個」）
  - 格式化金額顯示（千分位逗號）

**優先級**：P0（最高）

**備註**：
- Prototype 階段**不需要**統計圖表
- Prototype 階段**不需要**最低價/平均價等統計指標
- 僅需列出原始報價數字即可

---

### 需求 P1-4：基本表單管理

**用戶故事**：作為管理員，我希望能管理已建立的表單，以便調整或停用表單。

**驗收標準**：

#### 4.1 表單列表
- WHEN 管理員查看表單列表 THEN 系統 SHALL 顯示：
  - 表單標題
  - 廠商名稱
  - 建立時間
  - 填寫狀態（未填寫/已填寫 X 次）
  - 表單狀態（開啟/關閉）
  - 操作按鈕（編輯/刪除/複製/關閉）

#### 4.2 編輯表單
- WHEN 管理員編輯表單 THEN 系統 SHALL 允許修改：
  - 表單標題
  - 廠商資訊（公司名稱、電話、Email）
  - 商品清單（新增、修改、刪除商品項目）
  - 填寫模式（只能填一次/可修改）
- WHEN 管理員儲存編輯 THEN 系統 SHALL：
  - 更新表單內容
  - 保持原有表單連結不變
  - 顯示更新成功訊息
- IF 表單已有報價記錄 THEN 系統 SHALL：
  - 顯示警告訊息「此表單已有報價記錄，修改可能影響報價數據」
  - 要求確認後才允許修改

#### 4.3 刪除表單
- WHEN 管理員刪除表單 THEN 系統 SHALL：
  - 顯示確認對話框「確定要刪除此表單？此操作無法復原」
  - IF 確認刪除 THEN 刪除表單及所有相關報價記錄
  - IF 取消 THEN 返回表單列表

#### 4.4 關閉表單
- WHEN 管理員關閉表單 THEN 系統 SHALL：
  - 將表單狀態設為「關閉」
  - 保留表單和報價記錄
- WHEN 廠商開啟已關閉的表單連結 THEN 系統 SHALL：
  - 顯示「此表單已關閉，無法填寫」訊息
  - 不顯示表單內容
- WHEN 管理員重新開啟表單 THEN 系統 SHALL 允許廠商繼續填寫

#### 4.5 複製表單
- WHEN 管理員複製表單 THEN 系統 SHALL：
  - 建立新表單
  - 複製原表單的商品清單（名稱、規格、數量、單位）
  - **不複製**廠商資訊（需重新填寫）
  - **不複製**報價記錄
  - 生成新的唯一連結
  - 自動命名為「[原表單名稱] - 複製」

**優先級**：P0（最高）

---

### 需求 P1-5：基本管理員認證

**用戶故事**：作為管理員，我希望能安全登入系統。

**驗收標準**：
- WHEN 管理員訪問系統 THEN 系統 SHALL 要求登入
- WHEN 管理員輸入帳號密碼 THEN 系統 SHALL 驗證身份
- IF 登入成功 THEN 系統 SHALL：
  - 建立登入 Session
  - 導向表單管理頁面
- IF 登入失敗 THEN 系統 SHALL 顯示「帳號或密碼錯誤」訊息
- WHEN 管理員登出 THEN 系統 SHALL 清除 Session 並返回登入頁面

**優先級**：P1

**備註**：
- Prototype 階段僅需單一管理員帳號
- 不需要註冊功能
- 不需要忘記密碼功能

---

## 3. Phase 2: 完整產品需求

### 需求 P2-1：進階統計分析

**用戶故事**：作為管理員，我希望系統提供進階分析功能，協助做出更好的採購決策。

**驗收標準**：
- WHEN 管理員查看統計頁面 THEN 系統 SHALL 顯示：
  - **各商品統計指標**：
    - 最低價（標示來自哪個廠商和時間）
    - 最高價
    - 平均價
    - 價格變化率
  - **價格趨勢圖表**：
    - 折線圖：顯示各商品歷史價格變化
    - 柱狀圖：比較不同廠商的最新報價
  - **篩選功能**：
    - 依商品篩選
    - 依時間範圍篩選
    - 依廠商篩選
- WHEN 管理員選擇特定商品 THEN 系統 SHALL 顯示：
  - 該商品的歷史報價趨勢圖
  - 所有廠商對該商品的報價比較
  - 價格波動分析
- WHEN 管理員匯出報表 THEN 系統 SHALL 提供：
  - **Excel 格式**：
    - 包含所有報價明細
    - 包含統計指標
    - 多工作表分類（依商品或廠商）
  - **PDF 格式**：
    - 包含圖表
    - 包含摘要統計
    - 適合列印的版面配置
- WHEN 管理員查看儀表板 THEN 系統 SHALL 顯示：
  - 近期報價數量統計
  - 待處理表單數量
  - 價格異常提醒（價格大幅波動的商品）

**優先級**：P0（Phase 2 階段）

---

### 需求 P2-2：多用戶權限管理

**用戶故事**：作為系統管理員，我希望管理不同用戶權限，確保系統安全性。

**驗收標準**：

#### 2.1 用戶角色定義
系統 SHALL 支援以下角色：
- **超級管理員**：所有權限，包含用戶管理
- **一般管理員**：建立/編輯/刪除表單，查看報價
- **僅檢視**：僅能查看表單和報價，不能編輯

#### 2.2 用戶管理
- WHEN 超級管理員建立用戶帳號 THEN 系統 SHALL 允許設定：
  - 帳號、密碼
  - 用戶名稱、Email
  - 用戶角色
  - 帳號狀態（啟用/停用）
- WHEN 超級管理員修改用戶權限 THEN 系統 SHALL：
  - 立即生效
  - 記錄變更日誌（誰、何時、改了什麼）
  - 若該用戶正在使用系統，下次操作時套用新權限
- WHEN 超級管理員停用帳號 THEN 系統 SHALL：
  - 禁止該帳號登入
  - 若該用戶已登入，強制登出

#### 2.3 權限控制
- WHEN 用戶登入系統 THEN 系統 SHALL 驗證身份和權限
- IF 用戶權限不足訪問某功能 THEN 系統 SHALL：
  - 拒絕存取
  - 顯示「您沒有權限執行此操作」訊息
  - 記錄未授權存取嘗試
- WHEN 用戶長時間未活動（30 分鐘）THEN 系統 SHALL 自動登出

#### 2.4 操作日誌
- WHEN 用戶執行重要操作 THEN 系統 SHALL 記錄：
  - 建立/編輯/刪除表單
  - 修改用戶權限
  - 登入/登出
  - 記錄內容：用戶、時間、操作類型、影響對象

**優先級**：P0（Phase 2 階段）

---

### 需求 P2-3：資料安全與備份

**用戶故事**：作為系統管理員，我希望確保資料安全並有備份機制。

**驗收標準**：

#### 3.1 資料加密
- WHEN 系統處理敏感資料 THEN 系統 SHALL：
  - 使用 HTTPS 加密傳輸
  - 密碼使用雜湊演算法儲存（bcrypt 或 argon2）
  - 重要資料欄位加密儲存（如聯絡電話、Email）

#### 3.2 自動備份
- WHEN 系統每日運行 THEN 系統 SHALL：
  - 每日自動執行資料庫備份（建議時間：凌晨 3:00）
  - 保留最近 30 天的備份
  - 備份檔案加密壓縮
  - 備份成功/失敗通知管理員

#### 3.3 錯誤處理與恢復
- WHEN 發生系統異常 THEN 系統 SHALL：
  - 記錄完整錯誤日誌（時間、錯誤類型、堆疊追蹤）
  - 顯示友善的錯誤訊息給用戶（不洩漏技術細節）
  - 嘗試自動恢復（如重試連線）
- IF 資料庫連線中斷 THEN 系統 SHALL：
  - 顯示「系統暫時無法使用，請稍後再試」訊息
  - 每 5 秒嘗試重新連線
  - 重新連線成功後自動恢復服務

#### 3.4 資料還原
- WHEN 管理員需要還原資料 THEN 系統 SHALL：
  - 提供備份檔案列表（時間、大小）
  - 允許下載備份檔案
  - 提供還原操作介面（需超級管理員權限）
  - 還原前要求確認並警告「將覆蓋現有資料」

**優先級**：P0（Phase 2 階段）

---

### 需求 P2-4：通知系統（選項功能）

**用戶故事**：作為管理員，我希望在收到新報價時獲得通知。

**驗收標準**：

#### 4.1 通知設定
- WHEN 管理員設定通知偏好 THEN 系統 SHALL 允許選擇：
  - **LINE 通知**：輸入 LINE Notify Token
  - **Email 通知**：輸入接收 Email
  - **兩者皆啟用**
  - **關閉通知**
- WHEN 管理員測試通知 THEN 系統 SHALL 發送測試訊息

#### 4.2 通知觸發
- WHEN 廠商提交報價 THEN 系統 SHALL：
  - 根據管理員設定發送通知
  - 通知內容包含：
    - 廠商名稱
    - 表單標題
    - 提交時間
    - 報價摘要（總金額）
    - 查看完整報價的連結

#### 4.3 通知失敗處理
- IF LINE 通知發送失敗 THEN 系統 SHALL：
  - 記錄錯誤原因
  - 若有設定 Email，則改發 Email 通知
- IF Email 通知發送失敗 THEN 系統 SHALL：
  - 記錄錯誤原因
  - 在系統內顯示通知失敗提示

#### 4.4 通知歷史
- WHEN 管理員查看通知歷史 THEN 系統 SHALL 顯示：
  - 所有已發送的通知
  - 發送時間、類型、狀態（成功/失敗）
  - 失敗原因（若有）

**優先級**：P2（Phase 2 階段，選項功能）

**備註**：
- 此功能為選項功能，可依實際需求決定是否實作
- 建議於 Phase 2 後期評估是否加入

---

## 4. 系統架構建議

### 4.1 技術棧建議

#### 前端
- **框架**：Next.js 14+ (App Router)
- **UI 框架**：
  - Tailwind CSS（樣式）
  - Shadcn/ui 或 Radix UI（元件庫）
- **狀態管理**：React Context 或 Zustand（Prototype 可不用）
- **表單處理**：React Hook Form + Zod（驗證）
- **圖表庫**：Recharts 或 Chart.js（Phase 2）

#### 後端
- **API**：Next.js API Routes
- **ORM**：Prisma 或 Drizzle ORM
- **認證**：NextAuth.js（Phase 2 多用戶時使用）

#### 資料庫
- **PostgreSQL**（選擇以下服務之一）：
  - Supabase（推薦，提供額外功能）
  - Neon（無伺服器 PostgreSQL）
  - Railway（簡單部署）

#### 部署
- **前端 + API**：Vercel（最簡單）或 Railway
- **資料庫**：如上述資料庫服務

#### 其他服務（Phase 2）
- **Email**：Resend 或 SendGrid
- **LINE Notify**：官方 API（簡單易用）
- **檔案匯出**：
  - Excel：ExcelJS 或 xlsx
  - PDF：jsPDF 或 Puppeteer

---

### 4.2 資料模型設計

#### Phase 1 核心資料表

```sql
-- 用戶表（簡化版，Phase 1 可用檔案或環境變數儲存單一管理員）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 表單主表
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(100) NOT NULL,
  vendor_phone VARCHAR(50) NOT NULL,
  vendor_email VARCHAR(255) NOT NULL,
  allow_multiple_submissions BOOLEAN DEFAULT FALSE, -- false=只能填一次, true=可修改
  status VARCHAR(20) DEFAULT 'open', -- 'open' or 'closed'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 表單商品項目
CREATE TABLE form_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  specification TEXT, -- 規格描述，如「每打」、「50個」
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 報價記錄（表頭）
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1, -- 版本號，用於追蹤修改
  total_amount DECIMAL(12, 2),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) -- 記錄提交來源（選用）
);

-- 報價明細（表身）
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  form_item_id UUID REFERENCES form_items(id),
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL, -- unit_price * quantity
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引優化
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_form_items_form_id ON form_items(form_id);
CREATE INDEX idx_quotations_form_id ON quotations(form_id);
CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
```

#### Phase 2 擴充資料表

```sql
-- 擴充用戶表（多用戶權限）
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'admin'; -- 'super_admin', 'admin', 'viewer'
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active'; -- 'active', 'inactive'

-- 操作日誌
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'create_form', 'edit_form', 'delete_form', etc.
  target_type VARCHAR(50), -- 'form', 'user', etc.
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知設定
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  line_notify_token VARCHAR(255),
  email_enabled BOOLEAN DEFAULT TRUE,
  line_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知歷史
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20), -- 'email', 'line'
  status VARCHAR(20), -- 'success', 'failed'
  content TEXT,
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4.3 API 設計

#### Phase 1 核心 API

```
# 認證
POST   /api/auth/login              # 管理員登入
POST   /api/auth/logout             # 管理員登出

# 表單管理（需認證）
GET    /api/forms                   # 取得表單列表
POST   /api/forms                   # 建立新表單
GET    /api/forms/:id               # 取得表單詳情
PUT    /api/forms/:id               # 更新表單
DELETE /api/forms/:id               # 刪除表單
POST   /api/forms/:id/duplicate     # 複製表單
PATCH  /api/forms/:id/status        # 更新表單狀態（開啟/關閉）

# 報價填寫（公開，透過唯一連結）
GET    /api/public/forms/:uuid      # 取得表單內容（廠商填寫頁面）
POST   /api/public/forms/:uuid/submit # 提交報價

# 報價查詢（需認證）
GET    /api/quotations/form/:formId # 取得特定表單的所有報價
GET    /api/quotations/:id          # 取得報價詳情
```

#### Phase 2 擴充 API

```
# 用戶管理（需超級管理員權限）
GET    /api/users                   # 取得用戶列表
POST   /api/users                   # 建立用戶
PUT    /api/users/:id               # 更新用戶
DELETE /api/users/:id               # 刪除用戶

# 統計分析（需認證）
GET    /api/analytics/overview      # 儀表板概覽
GET    /api/analytics/price-trends  # 價格趨勢分析
GET    /api/analytics/export        # 匯出報表

# 通知設定（需認證）
GET    /api/notifications/settings  # 取得通知設定
PUT    /api/notifications/settings  # 更新通知設定
POST   /api/notifications/test      # 測試通知

# 系統管理（需超級管理員權限）
GET    /api/admin/logs              # 取得操作日誌
GET    /api/admin/backups           # 取得備份列表
POST   /api/admin/backups/restore   # 還原備份
```

---

### 4.4 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                         使用者端                              │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  管理員介面   │              │  廠商填寫頁   │            │
│  │ (需登入)     │              │ (公開連結)    │            │
│  └──────────────┘              └──────────────┘            │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
             └────────────┬───────────┘
                          │
                    HTTPS (Vercel)
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    Next.js 應用層                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              App Router (React Server Components)    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │              API Routes (Serverless Functions)       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │              NextAuth.js (認證)                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │              Prisma ORM (資料存取層)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    PostgreSQL 資料庫                         │
│                   (Supabase / Neon)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 外部服務 (Phase 2)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  LINE Notify │  │   SendGrid   │  │  備份儲存空間  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 非功能需求

### 5.1 效能要求
- **頁面載入時間**：< 2 秒（首次載入）
- **API 回應時間**：< 1 秒（一般操作）
- **報價提交**：< 1 秒（回應時間）
- **報表生成**：< 5 秒（包含 100 筆報價）
- **並發處理**：支援至少 50 個同時使用者

### 5.2 可用性要求
- **瀏覽器支援**：
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **裝置支援**：
  - 桌面電腦（主要）
  - 平板（支援）
  - 手機（基本支援，廠商填寫頁需 RWD）
- **無障礙**：符合 WCAG 2.1 Level AA（Phase 2）

### 5.3 安全性要求
- **傳輸加密**：全站 HTTPS
- **密碼強度**：至少 8 字元，包含英數字
- **Session 管理**：30 分鐘無操作自動登出
- **防護機制**：
  - SQL Injection 防護（使用 ORM）
  - XSS 防護（輸出編碼）
  - CSRF 防護（CSRF Token）
  - Rate Limiting（API 呼叫頻率限制）

### 5.4 維護性要求
- **程式碼品質**：
  - TypeScript 嚴格模式
  - ESLint + Prettier
  - 80% 以上單元測試覆蓋率（Phase 2）
- **文件**：
  - README（安裝與執行說明）
  - API 文件（Swagger 或 Postman）
  - 使用者手冊（Phase 2）
- **監控**：
  - 錯誤追蹤（Sentry 或 Bugsnag）
  - 效能監控（Vercel Analytics）

### 5.5 擴展性要求
- **資料量**：
  - 支援至少 1,000 張表單
  - 支援至少 10,000 筆報價記錄
- **模組化設計**：便於後續新增功能
- **資料庫索引**：確保查詢效能

---

## 6. 開發優先序

### Phase 1: Prototype（預估 3-4 週）

#### Week 1：環境建置與基礎功能
1. **專案初始化**（Day 1-2）
   - 建立 Next.js 專案
   - 設定 TypeScript、ESLint、Prettier
   - 設定資料庫（Supabase 或 Neon）
   - 設定 Prisma ORM
   - 部署到 Vercel（測試環境）

2. **資料庫設計**（Day 2-3）
   - 建立資料表 Schema
   - 撰寫 Migration
   - 建立測試資料

3. **基本認證**（Day 3-4）
   - 實作登入頁面
   - 實作 Session 管理
   - 實作路由保護

4. **基本 UI 框架**（Day 4-5）
   - 設定 Tailwind CSS + UI 元件庫
   - 建立 Layout（Header、Sidebar）
   - 建立基本頁面結構

#### Week 2-3：核心功能開發
5. **表單建立功能**（P1-1）（Day 6-9）
   - 表單建立頁面 UI
   - 商品項目動態新增/刪除
   - 表單儲存 API
   - 生成唯一連結

6. **表單管理功能**（P1-4）（Day 10-12）
   - 表單列表頁面
   - 編輯表單功能
   - 刪除表單功能
   - 關閉/開啟表單
   - 複製表單功能

7. **廠商報價填寫**（P1-2）（Day 13-15）
   - 公開表單頁面 UI（RWD）
   - 報價填寫表單
   - 自動計算小計與總計
   - 報價提交 API
   - 填寫次數限制邏輯

#### Week 3-4：報價查看與測試
8. **報價查看功能**（P1-3）（Day 16-18）
   - 表單詳情頁面
   - 報價列表展示
   - 歷史報價查詢
   - 依商品分組顯示

9. **測試與修正**（Day 19-21）
   - 整合測試
   - 使用者測試
   - Bug 修正
   - 效能優化

10. **部署與交付**（Day 22）
    - 部署到正式環境
    - 撰寫使用說明
    - Prototype 驗收

---

### Phase 2: 完整產品（預估 4-6 週）

#### Week 1-2：統計分析功能
1. **統計指標計算**（P2-1）（Week 1）
   - 實作價格統計演算法
   - 建立統計 API
   - 儀表板頁面

2. **圖表展示**（P2-1）（Week 1-2）
   - 整合圖表庫（Recharts）
   - 價格趨勢圖表
   - 廠商比較圖表
   - 篩選功能

3. **報表匯出**（P2-1）（Week 2）
   - Excel 匯出功能
   - PDF 匯出功能
   - 報表樣板設計

#### Week 3-4：權限與安全
4. **多用戶權限**（P2-2）（Week 3）
   - 用戶管理介面
   - 角色權限控制
   - 操作日誌記錄

5. **資料安全**（P2-3）（Week 3-4）
   - 資料加密實作
   - 自動備份機制
   - 錯誤處理優化
   - 資料還原功能

#### Week 5-6：通知與優化
6. **通知系統（選項）**（P2-4）（Week 5）
   - LINE Notify 整合
   - Email 通知整合
   - 通知設定介面
   - 通知歷史查詢

7. **系統優化**（Week 5-6）
   - 效能調整
   - UI/UX 優化
   - 單元測試補完
   - 文件撰寫

8. **最終測試與交付**（Week 6）
   - 完整功能測試
   - 壓力測試
   - 使用者驗收測試
   - 正式上線

---

## 7. 驗收與交付

### 7.1 Prototype 驗收標準

#### 功能驗收
- ✅ 管理員能成功登入系統
- ✅ 管理員能建立報價表單並生成唯一連結
- ✅ 表單能設定自訂商品（名稱、規格、數量、單位）
- ✅ 表單能預填廠商資訊（公司名稱、電話、Email）
- ✅ 表單能設定填寫模式（只能一次/可修改）
- ✅ 廠商能透過連結開啟表單並填寫報價
- ✅ 廠商提交報價後系統能正確記錄
- ✅ 「只能填一次」模式下，已提交表單無法再次填寫
- ✅ 「可修改」模式下，廠商能更新報價並保留歷史版本
- ✅ 管理員能查看所有報價記錄
- ✅ 報價歷史能依商品分組顯示
- ✅ 管理員能編輯、刪除、關閉、複製表單
- ✅ 關閉的表單無法填寫

#### 技術驗收
- ✅ 系統能在 Vercel 或其他雲端服務上正常運行
- ✅ 資料庫能正常讀寫
- ✅ 所有 API 回應時間 < 2 秒
- ✅ 無重大 Bug（P0/P1 級別）
- ✅ 程式碼已提交至 Git Repository
- ✅ 提供基本部署文件

#### 使用者驗收
- ✅ 管理員能在 10 分鐘內學會系統操作
- ✅ 廠商能在 5 分鐘內完成報價填寫
- ✅ 介面直觀易用，無明顯困惑點

---

### 7.2 完整產品驗收標準

#### 功能驗收（包含 Prototype + Phase 2）
- ✅ 所有 Phase 1 功能正常運作
- ✅ 統計分析功能完整（指標計算、圖表顯示）
- ✅ 報表匯出功能（Excel、PDF）正常
- ✅ 多用戶權限管理正常運作
- ✅ 不同角色的權限控制正確
- ✅ 操作日誌能正確記錄
- ✅ 資料加密正常運作
- ✅ 自動備份機制正常執行
- ✅ 資料還原功能正常
- ✅ （選項）通知系統正常運作

#### 效能驗收
- ✅ 頁面載入時間 < 2 秒
- ✅ API 回應時間 < 1 秒
- ✅ 報表生成時間 < 5 秒（100 筆報價）
- ✅ 支援 50 個並發使用者無明顯延遲

#### 安全驗收
- ✅ 全站 HTTPS
- ✅ 通過基本安全測試（XSS、SQL Injection、CSRF）
- ✅ 密碼已雜湊儲存
- ✅ Session 管理正常
- ✅ 未授權存取被正確阻擋

#### 穩定性驗收
- ✅ 系統連續運行 7 天無重大錯誤
- ✅ 錯誤處理機制正常
- ✅ 資料備份機制正常執行 7 天

#### 文件交付
- ✅ README（安裝與執行說明）
- ✅ API 文件
- ✅ 資料庫 Schema 文件
- ✅ 使用者操作手冊
- ✅ 系統管理手冊

#### 測試交付
- ✅ 單元測試覆蓋率 > 70%
- ✅ 整合測試通過
- ✅ 使用者驗收測試通過

---

## 8. 風險與假設

### 8.1 風險
| 風險項目 | 影響程度 | 應對策略 |
|---------|---------|---------|
| 雲端服務不穩定 | 高 | 選擇可靠的服務商（Vercel、Supabase），設定錯誤監控 |
| 資料庫效能問題 | 中 | 建立適當索引，定期效能測試 |
| 並發填寫衝突 | 中 | 實作樂觀鎖定或悲觀鎖定機制 |
| 通知服務失敗 | 低 | 實作重試機制，記錄失敗日誌 |
| 功能需求變更 | 中 | 模組化設計，預留擴充空間 |

### 8.2 假設
- 廠商具備基本網路使用能力
- 管理員數量不會超過 10 人
- 單一表單商品項目不會超過 100 項
- 報價數據不會超過 100,000 筆（前 2 年）
- 廠商會使用現代瀏覽器訪問系統

---

## 9. 成功指標

### Prototype 階段
- ✅ 核心流程可正常運作
- ✅ 管理員能順利完成 3 次完整測試（建立表單 → 廠商填寫 → 查看報價）
- ✅ 無 P0 級別 Bug

### 完整產品階段
- ✅ 所有功能驗收通過
- ✅ 使用者滿意度 > 80%（問卷調查）
- ✅ 系統可用性 > 99%（7 天監控）
- ✅ 平均報價流程時間縮短 50%（相較人工流程）

---

## 10. 附錄

### 10.1 名詞解釋
- **表單**：管理員建立的報價收集表單，包含商品清單和廠商資訊
- **商品項目**：表單中的個別商品，包含名稱、規格、數量、單位
- **報價**：廠商針對表單中所有商品填寫的單價資訊
- **報價版本**：同一廠商多次提交的報價記錄（僅在「可修改」模式下）
- **填寫模式**：
  - **只能填一次**：廠商提交後無法再次填寫或修改
  - **可修改**：廠商可多次提交，系統保留所有歷史版本

### 10.2 使用情境範例

#### 情境 1：建立新表單並收集報價
1. 管理員登入系統
2. 點選「建立新表單」
3. 填寫表單標題：「2024-Q1 辦公用品採購」
4. 填寫廠商資訊：
   - 公司名稱：ABC 文具公司
   - 電話：02-1234-5678
   - Email: abc@example.com
5. 新增商品項目：
   - 商品 1：手套，規格：醫療用，數量：10，單位：打
   - 商品 2：口罩，規格：三層防護，數量：20，單位：50個/盒
6. 設定填寫模式：只能填一次
7. 儲存並複製表單連結
8. 將連結傳送給 ABC 文具公司
9. ABC 公司開啟連結，填寫各商品單價並提交
10. 管理員收到通知（Phase 2），查看報價內容

#### 情境 2：比較多次報價
1. 管理員建立表單（允許修改模式）
2. 廠商第 1 次提交報價（2024-01-10）
3. 廠商第 2 次更新報價（2024-01-15，價格下調）
4. 管理員查看報價歷史：
   - 手套（醫療用，10 打）：
     - 2024-01-10：$150/打
     - 2024-01-15：$140/打（最新）
   - 口罩（三層防護，20 盒）：
     - 2024-01-10：$80/盒
     - 2024-01-15：$75/盒（最新）
5. 管理員根據最新報價做出採購決策

---

## 11. 變更記錄

| 版本 | 日期 | 變更內容 | 變更人 |
|-----|------|---------|-------|
| 1.0 | 2024-01-XX | 初版 PRD | [您的名字] |

---

**文件狀態**：✅ 待審核
**下一步行動**：
1. 利害關係人審核本 PRD
2. 確認技術可行性
3. 評估開發時程與資源
4. 開始 Phase 1 開發

---

**聯絡資訊**：
- 專案負責人：[姓名] [Email]
- 技術負責人：[姓名] [Email]
