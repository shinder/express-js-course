# Express.js 教學講義範例：通訊錄網站

依 `docs/express-js.md` 講義逐單元實作的範例。最終成果是一個具備
**登入／權限管控、CRUD、搜尋、分頁、收藏** 的通訊錄網站（Express 5 + EJS + MySQL/MariaDB）。

與 Express 沒有直接關係的獨立範例（模組機制、http 模組、process、CORS）放在 [`demo/`](demo/)。

## 環境需求

- Node.js v18 以上（開發以 v22/v24 測試）
- pnpm
- MySQL 或 MariaDB

## 安裝

```bash
pnpm install
```

> 本專案使用原生模組 `bcrypt`，`pnpm-workspace.yaml` 已設定允許其建置。

## 資料庫設定

匯入官方範例資料庫（建立 `shin01`，含 address_book／members／ab_likes 等表），再套用修補：

```bash
mysql -uroot -proot -h 127.0.0.1 < db/shin01pma.sql
mysql -uroot -proot -h 127.0.0.1 < db/patch.sql
```

> `db/shin01pma.sql` 為 phpMyAdmin 匯出檔，不含 `DROP TABLE`；若要重匯請先 `DROP DATABASE shin01`。
> `db/patch.sql` 補上 `created_at` 的預設值，讓新增資料時可自動填入時間。

## 環境變數

複製範本並視需要調整：

```bash
cp .env.example .env
```

預設連線本機 MariaDB（`127.0.0.1:3306`、root/root、資料庫 `shin01`）。

## 執行

```bash
pnpm dev     # 以 nodemon 開發模式啟動
pnpm start   # 一般啟動
```

開啟 <http://localhost:3000>，通訊錄在 <http://localhost:3000/address-book>。

### 測試帳號

| Email          | 密碼   | 暱稱   |
| -------------- | ------ | ------ |
| ming@test.com  | 123456 | 大明   |
| shin@test.com  | 123456 | 小新   |
| mary@test.com  | 123456 | 瑪麗亞 |

登入後即可看到管理員版列表（含新增、編輯、刪除、批次刪除、收藏）。

## 專案結構

```
.
├── index.js                # 主程式：中介軟體、認證、各示範路由
├── routes/                 # 路由模組（address-book、admin、member）
├── views/                  # EJS 模板（partials、address-book、login…）
├── public/                 # 靜態檔（css、js、favicon、上傳圖片）
├── utils/                  # 連線池、上傳模組
├── db/                     # 資料庫 schema 與修補
└── demo/                   # 與 Express 無關的獨立範例（模組、http、process、CORS）
```

## 單元對應

| 單元 | 主題 | 主要位置 |
| ---- | ---- | -------- |
| 三 | CJS／ESM 模組 | `demo/03-modules/` |
| 四 | http 模組 createServer | `demo/04-http/` |
| 五 | process 物件 | `demo/05-process/` |
| 六 | Express 簡介、靜態檔案 | `index.js`、`public/` |
| 七 | EJS 模板引擎 | `views/` |
| 八 | Query String | `index.js`（/try-qs、/api/products） |
| 九 | 表單與 middlewares、multer | `index.js`、`utils/upload-images.js` |
| 十 | 動態路由 | `index.js` |
| 十一 | 路由模組化 | `routes/admin.js`、`routes/member.js` |
| 十二 | 前端表單格式 | `views/try-formats.ejs` |
| 十三 | Cookie 與 Session | `index.js` |
| 十四 | 時間格式 Moment.js | `index.js`（/try-moment） |
| 十五 | 連線 MySQL | `utils/connect-mysql.js` |
| 十六 | Session 入庫 | `index.js`（express-mysql-session） |
| 十七～二十一 | 通訊錄 CRUD、Zod 驗證、登入權限、JWT | `routes/address-book.js`、`views/address-book/`、`index.js` |
| 附錄二 | CORS | `demo/cors/` |

## API 文件（Swagger / OpenAPI）

本專案的 JSON API（`/address-book/api/*`、`/login`、`/login-jwt`、`/jwt-data` 等）可用 Swagger 產生互動式文件。在 Node/Express 常見三種作法：

| 作法 | 概念 | 取捨 |
| --- | --- | --- |
| **swagger-jsdoc** | 在各路由上方加 `@openapi` JSDoc 註解，再編譯成 OpenAPI 規格 | 改動最小、可漸進；本專案採用此法 |
| 手寫 OpenAPI | 自行維護一份 `openapi.yaml` / `openapi.json` | 文件與程式碼分離，但需手動保持同步 |
| zod-to-openapi | 由既有的 Zod schema 自動產生規格 | 單一真實來源，但路由要改成註冊式寫法 |

> OpenAPI 的實際實作放在 **`feature/swagger-openapi`** 分支（使用 swagger-jsdoc）。
> 切到該分支啟動後，可在 <http://localhost:3000/api-docs> 瀏覽 Swagger UI，原始規格在 <http://localhost:3000/openapi.json>。
> `main` 分支僅保留本說明、不含 Swagger 相依套件。
