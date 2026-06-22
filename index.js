// index.js - 使用 ESM 語法
import express from 'express';
import 'dotenv/config'; // 載入環境變數檔內容到 process.env

const app = express();
const port = process.env.PORT || 3000;

// 設定 EJS 為模板引擎（模板檔預設放在 ./views）
app.set('view engine', 'ejs');

// 基本路由
app.get('/', (req, res) => {
  res.render('home', { name: 'Shinder' });
});

app.get('/about', (req, res) => {
  res.send('<h1>關於我們</h1><p>這是使用 Express 和 ESM 的範例。</p>');
});

// 以表格呈現陣列裡的資料
app.get('/sales-array', (req, res) => {
  const sales = [
    { name: 'Bill', age: 28, id: 'A001' },
    { name: 'Peter', age: 32, id: 'A002' },
    { name: 'Carl', age: 29, id: 'A003' },
  ];
  res.render('sales-array', { sales });
});

// JSON API 路由
app.get('/api/info', (req, res) => {
  res.json({
    name: 'My Express App',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 設定靜態檔案服務（放在其他路由之後、404 之前）
app.use(express.static('public'));

// 404 處理（必須放在所有路由之後）
app.use((req, res) => {
  res.status(404).send('<h1>404 - 頁面不存在</h1>');
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Express 伺服器已啟動：http://localhost:${port}`);
});
