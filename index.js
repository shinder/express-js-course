// index.js - 使用 ESM 語法
import express from 'express';
import 'dotenv/config'; // 載入環境變數檔內容到 process.env
import multer from 'multer';
import upload from './utils/upload-images.js';
import adminRouter from './routes/admin.js';
import memberRouter from './routes/member.js';

const app = express();
const port = process.env.PORT || 3000;

// 設定 EJS 為模板引擎（模板檔預設放在 ./views）
app.set('view engine', 'ejs');

// Express 5 預設的 query parser 為 simple（不支援巢狀物件）；
// 設為 extended 以改用 qs 套件解析，支援 user[name]=Amy 這類巢狀語法
app.set('query parser', 'extended');

// 全域中介軟體：處理 URL-encoded 表單資料（HTML form 預設格式）
app.use(express.urlencoded({ extended: true }));
// 全域中介軟體：解析 application/json
app.use(express.json());

// 自訂中介軟體：記錄每個請求
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log('主體內容：', req.body);
  }
  next();
};
app.use(requestLogger);

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

// 1. 處理 URL-encoded 表單資料
app.get('/try-post-form', (req, res) => {
  res.render('try-post-form');
});
// 取得 urlencoded parser（使用 qs lib），當作該路由專用的 middleware
const urlencodedParser = express.urlencoded({ extended: true });
app.post('/try-post-form', urlencodedParser, (req, res) => {
  res.render('try-post-form', req.body);
});

// 2. 處理 JSON / URL-encoded 資料（已由全域 middleware 解析，皆放在 req.body）
app.post('/try-post', (req, res) => {
  res.json(req.body);
});

// 使用 multer 處理檔案上傳
app.get('/try-upload', (req, res) => {
  res.render('try-upload');
});
// 單一檔案上傳
app.post('/try-upload', upload.single('avatar'), (req, res) => {
  const { file, body } = req;
  console.log(file); // 上傳的檔案資訊
  console.log(body); // 其他表單文字欄位
  res.json({ file, body });
});
// 一個欄位上傳多個檔案
app.post('/try-uploads', upload.array('photos'), (req, res) => {
  res.json(req.files);
});

// 動態路由：URL 路徑中以 : 開頭的部分會塞進 req.params
// 造訪 /users/123 → req.params.id = "123"
app.get('/users/:id', (req, res) => {
  res.send(`User ID: ${req.params.id}`);
});

// 多個參數：/params-1/edit/42 → { action: "edit", id: "42" }
app.get('/params-1/:action/:id', (req, res) => {
  res.json(req.params);
});

// 一個處理函式對應多個路徑（陣列）
app.get(['/params-2', '/params-2/:action', '/params-2/:action/:id'], (req, res) => {
  res.json(req.params);
});

// 路徑中固定段與參數可混用
app.get('/users/:userId/profile', (req, res) => {
  res.json(req.params);
});

// 路由模組化：掛載 router（當成中介軟體使用，放在 404 之前）
app.use(adminRouter); // 無前綴：/admin/123
app.use('/v1', adminRouter); // 有前綴：/v1/admin/123，req.baseUrl = /v1
app.use(memberRouter); // router.route() 寫法：/member/edit/:id

// 設定靜態檔案服務（放在其他路由之後、404 之前）
app.use(express.static('public'));

// 404 處理（必須放在所有路由之後）
app.use((req, res) => {
  res.status(404).send('<h1>404 - 頁面不存在</h1>');
});

// 錯誤處理中介軟體（放在所有路由之後、app.listen 之前）
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '檔案太大' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '檔案數量超過限制' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: '上傳不可接受的檔案' });
    }
  }
  res.status(500).json({ error: error.message });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Express 伺服器已啟動：http://localhost:${port}`);
});
