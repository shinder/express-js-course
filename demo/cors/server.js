// demo/cors/server.js
// 可實際操作的 CORS 示範：同一個 Node 行程開兩個埠
//   - API 伺服器： http://localhost:3100 （設定 CORS，只允許 3200 來源）
//   - 靜態網頁：   http://localhost:3200 （提供 client/index.html）
// 瀏覽器從 3200 對 3100 發出跨來源請求，即可觀察 CORS 行為。
//
// 執行方式：node demo/cors/server.js
// 然後用瀏覽器開 http://localhost:3200
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WEB_ORIGIN = "http://localhost:3200";

// ===== API 伺服器（port 3100）=====
const api = express();
api.use(express.json());

// 使用 cors 套件設定跨來源規則
api.use(
  cors({
    origin: WEB_ORIGIN, // 只允許這個來源
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 預檢結果快取一天
    exposedHeaders: ["X-Total-Count"], // 讓前端 JS 能讀到這個自訂回應標頭
  })
);

// 簡單請求（GET）
api.get("/api/data", (req, res) => {
  res.set("X-Total-Count", "42");
  res.json({ message: "這是來自 API 的資料", time: new Date().toISOString() });
});

// 會觸發預檢（PUT + application/json）
api.put("/api/users/:id", (req, res) => {
  res.json({ success: true, id: req.params.id, updated: req.body });
});

api.listen(3100, () => {
  console.log("API 伺服器： http://localhost:3100 （允許來源 " + WEB_ORIGIN + "）");
});

// ===== 靜態網頁伺服器（port 3200）=====
const web = express();
web.use(express.static(path.join(__dirname, "client")));
web.listen(3200, () => {
  console.log("網頁伺服器：http://localhost:3200 （在此頁面測試跨來源請求）");
});
