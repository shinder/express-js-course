// server.js - 使用 ESM 語法的內建 http 伺服器
// 執行方式：node server.js（或 node --watch server.js 熱重啟）
import http from 'node:http';

// 建立伺服器
const server = http.createServer((req, res) => {
  // 使用 WHATWG URL 解析請求路徑（取代已棄用的 url.parse）
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // 設定回應標頭
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

  // 簡單頁面
  res.end(`
    <h1>歡迎來到我的網站</h1>
    <p>路徑：${pathname}</p>
    <p>目前時間：${new Date().toLocaleString('zh-TW')}</p>
  `);
});

// 設定埠號（優先使用環境變數）
const PORT = process.env.PORT || 3000;

// 監聽埠號
server.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});

// 收到結束訊號時優雅關閉伺服器（避免請求中途被切斷）
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 訊號，正在關閉伺服器...');
  server.close(() => {
    console.log('伺服器已關閉');
  });
});
