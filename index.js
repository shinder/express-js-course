// index.js - 使用 ESM 語法
import express from 'express';
import 'dotenv/config'; // 載入環境變數檔內容到 process.env
import multer from 'multer';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import moment from 'moment-timezone';
import pool from './utils/connect-mysql.js';
import upload from './utils/upload-images.js';
import adminRouter from './routes/admin.js';
import memberRouter from './routes/member.js';
import addressBookRouter from './routes/address-book.js';

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
// 全域中介軟體：解析 cookies
app.use(cookieParser());

// 建立 Session Store：將 session 儲存到 MySQL（取代預設的記憶體儲存）
const MySQLStoreClass = MySQLStore(session);
const sessionStore = new MySQLStoreClass({}, pool);

// 全域中介軟體：session
app.use(
  session({
    // 新用戶若未使用到 session 就不建立、不發送 cookie，避免每個訪客都產生 session
    saveUninitialized: false,
    // 沒有變更時不強制回存，可降低 store 寫入次數
    resave: false,
    // 用來簽署 session id，正式環境應改用環境變數
    secret: process.env.SESSION_SECRET || '雜湊 session id 的字串',
    store: sessionStore, // 使用 MySQL 作為 session 儲存媒體
    // cookie: {
    //   maxAge: 1200_000, // 20 分鐘，單位毫秒
    // },
  })
);

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

// 樣板共用的 res.locals 輔助函式
app.use((req, res, next) => {
  // 將關鍵字以 <b> 標示（樣板以 <%- 原樣輸出）
  res.locals.labelBold = (originStr, labelStr) => {
    // 先跳脫 HTML 特殊字元，避免資料含標籤時造成 XSS
    const escapeHtml = (s) =>
      String(s).replace(
        /[&<>"']/g,
        (c) =>
          ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
      );
    const safe = escapeHtml(originStr ?? '');
    if (!originStr || !labelStr) return safe;
    // 跳脫關鍵字的正規表達式特殊字元，再於「已跳脫」的字串上標示
    const labelEsc = escapeHtml(labelStr).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return safe.replace(new RegExp(`(${labelEsc})`, 'gi'), '<b>$1</b>');
  };

  // 將物件轉成 urlencoded 查詢字串（給分頁連結用），略過空值
  res.locals.objToUrlencoded = (obj) => {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined && v !== null && v !== '') usp.set(k, v);
    }
    return usp.toString();
  };

  next();
});

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

// 讀取資料表
app.get('/try-db', async (req, res) => {
  const sql = 'SELECT * FROM address_book LIMIT 3';

  // 第一個值為查詢的結果，第二個值為資料表欄位定義的相關資料
  const [rows, fields] = await pool.query(sql);
  res.json(rows);
});

// 新增資料（? 為佔位字元，可防止 SQL 注入）
app.get('/try-db2', async (req, res) => {
  const sql = `INSERT INTO address_book
    (name, email, mobile, address) VALUES (?, ?, ?, ?);`;
  const [result] = await pool.query(sql, [
    '小新',
    'shinder@test.com',
    '0912345678',
    '台北市信義區',
  ]);
  res.json(result);
});

// 時間格式：使用 Moment.js（含時區）
app.get('/try-moment', (req, res) => {
  const fm = 'YYYY-MM-DD HH:mm:ss';
  const m1 = moment(); // 當下時間
  const m2 = moment('2024-02-29'); // 2024 是閏年，合法
  const m3 = moment('2025-02-29'); // 2025 不是閏年，無效

  res.json({
    m1: m1.format(fm),
    m2: m2.format(fm),
    m3: m3.format(fm),
    m1v: m1.isValid(),
    m2v: m2.isValid(),
    m3v: m3.isValid(),
    // 將時間轉換到指定時區再格式化
    m1z: m1.tz('Europe/London').format(fm),
    m2z: m2.tz('Europe/London').format(fm),
  });
});

// Cookie：設定 cookie
app.get('/my-set-cookie', (req, res) => {
  // 基本設定
  res.cookie('username', 'shinder'); // 不設定過期時間，瀏覽器關閉時刪除

  // 完整選項設定
  res.cookie('userToken', 'secure-token-123', {
    maxAge: 2 * 60 * 60 * 1000, // 2小時後過期
    httpOnly: true, // 防止 XSS 攻擊
    // secure: process.env.NODE_ENV === 'production', // 生產環境使用 HTTPS
    sameSite: 'strict', // 防止 CSRF 攻擊
    path: '/', // 整個網站都可存取
  });

  res.send('Cookie 已設定');
});

// Cookie：讀取 cookie
app.get('/my-get-cookie', (req, res) => {
  const username = req.cookies.username || '訪客';
  const userToken = req.cookies.userToken || '無效的 Token';
  res.json({ username, userToken });
});

// Session：每次造訪累加 my_num
app.get('/try-sess', (req, res) => {
  // 如果 my_num 不存在，先設為 0；接著遞增
  req.session.my_num ||= 0;
  req.session.my_num++;
  res.json(req.session);
});

// 前端發送表單資料的三種格式：用同一端點接收
app.get('/try-formats', (req, res) => {
  res.render('try-formats');
});
// upload.none() 解析「純文字欄位」的 multipart/form-data；
// json 與 urlencoded 則由全域 middleware 解析，皆放在 req.body
app.post('/try-formats', upload.none(), (req, res) => {
  res.json(req.body);
});

// 路由模組化：掛載 router（當成中介軟體使用，放在 404 之前）
app.use(adminRouter); // 無前綴：/admin/123
app.use('/v1', adminRouter); // 有前綴：/v1/admin/123，req.baseUrl = /v1
app.use(memberRouter); // router.route() 寫法：/member/edit/:id
app.use('/address-book', addressBookRouter); // 通訊錄

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
