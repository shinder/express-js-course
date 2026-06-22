// index.js - 使用 ESM 語法
import express from 'express';
import 'dotenv/config'; // 載入環境變數檔內容到 process.env

const app = express();
const port = process.env.PORT || 3000;

// 設定 EJS 為模板引擎（模板檔預設放在 ./views）
app.set('view engine', 'ejs');

// Express 5 預設的 query parser 為 simple（不支援巢狀物件）；
// 設為 extended 以改用 qs 套件解析，支援 user[name]=Amy 這類巢狀語法
app.set('query parser', 'extended');

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

// Query String：參數會被解析後放到 req.query（Object 型別）
app.get('/try-qs', (req, res) => {
  res.json(req.query);
});

// Query String 驗證與預設值
app.get('/api/products', (req, res) => {
  // 取得參數並設定預設值
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || 'name';
  const order = req.query.order === 'desc' ? 'desc' : 'asc';

  // 驗證參數
  if (page < 1) {
    return res.status(400).json({ error: '頁數必須大於 0' });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: '每頁數量必須在 1-100 之間' });
  }

  const validSortFields = ['name', 'price', 'category'];
  if (!validSortFields.includes(sortBy)) {
    return res.status(400).json({ error: '無效的排序欄位' });
  }

  // 模擬分頁處理
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  res.json({
    page: page,
    limit: limit,
    sortBy: sortBy,
    order: order,
    message: `第 ${page} 頁，每頁 ${limit} 項，按 ${sortBy} ${order} 排序`,
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
