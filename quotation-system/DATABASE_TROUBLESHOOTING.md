# 資料庫連線問題診斷指南

如果完全無法連線到 Supabase 資料庫，請按照以下步驟逐一排查：

## 🔍 步驟 1: 檢查 Supabase 專案狀態

1. 前往 Supabase Dashboard
2. 確認專案狀態是 **"Active"**（綠色）
3. 如果顯示 "Paused" 或 "Restoring"，需要等待或手動啟動

**可能的問題**：
- 免費方案會在 7 天無活動後暫停
- 專案正在維護中

**解決方案**：
- 點擊 "Restore project" 或 "Resume project"
- 等待 1-2 分鐘專案完全啟動

---

## 🔍 步驟 2: 檢查連接字串格式

### ✅ 正確的格式

前往 **Project Settings** → **Database** → **Connection string**

**重要**：必須選擇正確的模式和格式！

#### 選項 A: Transaction mode（推薦用於 Prisma）
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```
- 端口：**6543**
- 包含 `.pooler.`

#### 選項 B: Session mode
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```
- 端口：**5432**
- 包含 `.pooler.`

#### 選項 C: Direct connection（不推薦）
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```
- 端口：**5432**
- 直接連接到 `db.xxxxx.supabase.co`

**⚠️ 常見錯誤**：
- ❌ 忘記替換 `[YOUR-PASSWORD]`
- ❌ 複製時包含了額外的空格或換行
- ❌ 使用了錯誤的端口號

---

## 🔍 步驟 3: 處理密碼特殊字元

如果您的資料庫密碼包含特殊字元，需要進行 **URL encoding**：

### 需要編碼的字元：

| 字元 | 編碼後 | 範例 |
|------|--------|------|
| `@`  | `%40`  | `p@ss` → `p%40ss` |
| `#`  | `%23`  | `p#ss` → `p%23ss` |
| `$`  | `%24`  | `p$ss` → `p%24ss` |
| `%`  | `%25`  | `p%ss` → `p%25ss` |
| `&`  | `%26`  | `p&ss` → `p%26ss` |
| `+`  | `%2B`  | `p+ss` → `p%2Bss` |
| `=`  | `%3D`  | `p=ss` → `p%3Dss` |
| `?`  | `%3F`  | `p?ss` → `p%3Fss` |
| `/`  | `%2F`  | `p/ss` → `p%2Fss` |
| `:`  | `%3A`  | `p:ss` → `p%3Ass` |
| ` `  | `%20`  | `p ss` → `p%20ss` |

### 快速編碼工具：

**線上工具**：
- https://www.urlencoder.org/

**使用 Node.js**：
```bash
node -e "console.log(encodeURIComponent('your-password-here'))"
```

**範例**：
```bash
# 原始密碼：My$ecure@Pass#123
# 編碼後：My%24ecure%40Pass%23123

# 完整連接字串：
postgresql://postgres.xxxxx:My%24ecure%40Pass%23123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 🔍 步驟 4: 測試連線

### 方法 A: 使用 Prisma 測試

創建測試文件 `test-connection.js`：

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Connection successful!')

    // 嘗試執行簡單查詢
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query successful:', result)

  } catch (error) {
    console.error('❌ Connection failed:')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

執行測試：
```bash
DATABASE_URL="your-connection-string" node test-connection.js
```

### 方法 B: 使用 psql（如果已安裝）

```bash
psql "postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### 方法 C: 使用 Prisma CLI

```bash
DATABASE_URL="your-connection-string" npx prisma db pull
```

如果成功，會顯示：
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"
```

---

## 🔍 步驟 5: 檢查網路與防火牆

### 測試端口連通性

```bash
# 測試 6543 端口（Transaction mode）
nc -zv aws-0-us-west-1.pooler.supabase.com 6543

# 或使用 telnet
telnet aws-0-us-west-1.pooler.supabase.com 6543
```

成功的話會顯示：
```
Connection to aws-0-us-west-1.pooler.supabase.com port 6543 [tcp/*] succeeded!
```

### 可能的網路問題：

1. **公司/學校防火牆**
   - 可能封鎖了 PostgreSQL 端口（5432, 6543）
   - 解決：使用個人網路或 VPN

2. **VPN 干擾**
   - 某些 VPN 可能阻擋資料庫連線
   - 解決：暫時關閉 VPN 測試

3. **IPv6 vs IPv4 問題**
   - 某些網路只支援 IPv4
   - 解決：在連接字串後加上 `?options=-c%20client_encoding%3DUTF8`

---

## 🔍 步驟 6: 檢查 Prisma Schema 設定

確認 `prisma/schema.prisma` 中的設定正確：

```prisma
datasource db {
  provider = "postgresql"  // ✅ 必須是 postgresql，不是 sqlite
  url      = env("DATABASE_URL")
}
```

---

## 🔍 步驟 7: 常見錯誤訊息解讀

### ❌ Error: P1001 "Can't reach database server"

**可能原因**：
1. Supabase 專案已暫停
2. 連接字串錯誤
3. 網路/防火牆問題
4. 密碼錯誤

**解決方案**：
- 確認專案狀態是 Active
- 重新複製連接字串
- 檢查密碼特殊字元編碼
- 測試網路連通性

### ❌ Error: P1000 "Authentication failed"

**可能原因**：
- 密碼錯誤
- 密碼中的特殊字元未編碼

**解決方案**：
- 重置 Supabase 資料庫密碼：
  1. Dashboard → Settings → Database → Database password
  2. 點擊 "Reset database password"
  3. 設定一個**不含特殊字元**的新密碼（例如：`MyPassword123`）
  4. 更新連接字串

### ❌ Error: P1008 "Operations timed out"

**可能原因**：
- 網路延遲過高
- Supabase 專案負載過高
- 防火牆/代理伺服器問題

**解決方案**：
- 增加連接超時時間：
  ```bash
  DATABASE_URL="postgresql://...?connect_timeout=30"
  ```
- 檢查網路狀態
- 稍後再試

### ❌ Error: "SSL connection is required"

**解決方案**：
在連接字串後加上 SSL 參數：
```
postgresql://...?sslmode=require
```

或完整參數：
```
postgresql://...?sslmode=require&sslaccept=strict
```

---

## 🛠️ 快速修復步驟（推薦順序）

### 1️⃣ 重置密碼為簡單版本

1. 前往 Supabase Dashboard
2. Settings → Database → Database password
3. 點擊 "Reset database password"
4. 設定新密碼：**只用字母和數字**（例如：`TestPass123`）
5. 複製新的連接字串（Transaction mode）
6. 立即測試：
   ```bash
   DATABASE_URL="新的連接字串" npx prisma db pull
   ```

### 2️⃣ 使用 Direct connection

如果 Pooler 連接失敗，嘗試 Direct connection：

1. Supabase Dashboard → Database → Connection string
2. 選擇 **"Use connection pooling"** 旁邊的切換按鈕（關閉）
3. 選擇 **URI** 格式
4. 複製連接字串（端口應該是 5432）
5. 測試連接

### 3️⃣ 檢查 .env 文件

確認您的 `.env` 或環境變數設定正確：

```bash
# 檢查當前環境變數
echo $DATABASE_URL

# 或查看 .env 文件
cat .env
cat .env.production
```

確保：
- ✅ 沒有多餘的引號
- ✅ 沒有空格或換行
- ✅ 格式完全正確

---

## 📞 仍然無法解決？

### 提供以下資訊以便診斷：

1. **完整錯誤訊息**（遮蔽密碼）
   ```bash
   DATABASE_URL="your-connection-string" npx prisma db pull 2>&1 | tee error.log
   ```

2. **連接字串格式**（遮蔽密碼和具體值）
   ```
   postgresql://postgres.xxxxx:***@aws-0-xx.pooler.supabase.com:6543/postgres
   ```

3. **Supabase 專案資訊**
   - 區域（Region）：例如 US West
   - 專案狀態：Active / Paused
   - 計劃：Free / Pro

4. **本地環境**
   - 作業系統：Windows / Mac / Linux
   - 是否使用 VPN
   - 是否在公司網路

5. **測試結果**
   ```bash
   # 端口測試
   nc -zv aws-0-us-west-1.pooler.supabase.com 6543

   # Prisma 測試
   DATABASE_URL="..." npx prisma db pull
   ```

---

## ✅ 成功連接的標準輸出

當一切正常時，您應該看到：

```bash
$ DATABASE_URL="..." npx prisma migrate deploy

Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-0-us-west-1.pooler.supabase.com:6543"

1 migration found in prisma/migrations

Applying migration `20251106180045_init`

The following migration(s) have been applied:

migrations/
  └─ 20251106180045_init/
    └─ migration.sql

All migrations have been successfully applied.
```

如果看到這個，恭喜！資料庫已成功連接並初始化！🎉
