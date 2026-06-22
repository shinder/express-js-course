// demo/cors/server-manual.js
// 不使用 cors 套件，改以手動中介軟體設定 CORS 標頭（對應講義「基本設定」）。
// API 伺服器跑在 3100，可搭配 client/index.html（從 3200）測試。
//
// 執行方式：node demo/cors/server-manual.js
import express from "express";

const app = express();
app.use(express.json());

const WEB_ORIGIN = "http://localhost:3200";

// 基本 CORS 中介軟體
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", WEB_ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // 處理預檢請求
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/api/data", (req, res) => {
  res.json({ message: "（手動 CORS）這是來自 API 的資料" });
});

app.put("/api/users/:id", (req, res) => {
  res.json({ success: true, id: req.params.id, updated: req.body });
});

app.listen(3100, () => {
  console.log("手動 CORS API 伺服器： http://localhost:3100");
});
