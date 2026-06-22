// routes/address-book.js - 通訊錄列表與相關 API
import express from "express";
import moment from "moment-timezone";
import { z } from "zod";
import pool from "../utils/connect-mysql.js";
import upload from "../utils/upload-images.js";

const router = express.Router();

// 資料驗證結構（Zod）
const abItemSchema = z.object({
  name: z
    .string({ message: "姓名為必填欄位" })
    .min(2, { message: "姓名至少兩個字" }),
  email: z
    .string({ message: "電郵為必填欄位" })
    .email({ message: "格式必須為電郵格式" }),
  birthday: z
    .string()
    .date("日期格式: YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
});

// 取得目前登入會員的 id（未登入則為 0）
const getMemberId = (req) => {
  if (req.session.admin?.id) return +req.session.admin.id;
  return 0;
};

// 列表資料查詢核心函式
const getListData = async (req) => {
  const perPage = 20; // 每頁顯示筆數

  // 解析查詢參數
  const page = +req.query.page || 1;
  const keyword = req.query.keyword || "";
  const birth_begin = req.query.birth_begin || "";
  const birth_end = req.query.birth_end || "";
  const orderby = req.query.orderby || "";

  const member_id = getMemberId(req);

  // 初始化回傳物件
  let output = {
    success: false,
    redirect: "",
    totalRows: 0,
    totalPages: 0,
    page,
    perPage,
    rows: [],
    query: { ...req.query },
    keyword,
    birth_begin,
    birth_end,
    orderby,
  };

  // 頁碼邊界檢查
  if (page < 1) {
    output.redirect = `?page=1`;
    return output;
  }

  // 搜尋條件建構
  let sqlWhere = " WHERE 1 ";
  // 關鍵字搜尋（姓名和手機號碼）
  if (keyword) {
    const keywordEsc = pool.escape(`%${keyword}%`);
    sqlWhere += ` AND ( ab.name LIKE ${keywordEsc} OR ab.mobile LIKE ${keywordEsc} ) `;
  }
  // 生日範圍篩選
  if (birth_begin) {
    const m = moment(birth_begin);
    if (m.isValid()) {
      sqlWhere += ` AND ab.birthday >= '${m.format("YYYY-MM-DD")}' `;
    }
  }
  if (birth_end) {
    const m = moment(birth_end);
    if (m.isValid()) {
      sqlWhere += ` AND ab.birthday <= '${m.format("YYYY-MM-DD")}' `;
    }
  }

  // 排序功能映射
  const orderByMapping = {
    id_asc: " ORDER BY ab.ab_id ",
    id_desc: " ORDER BY ab.ab_id DESC ",
    birth_asc: " ORDER BY birthday ",
    birth_desc: " ORDER BY birthday DESC ",
    mobile_asc: " ORDER BY mobile ",
    mobile_desc: " ORDER BY mobile DESC ",
  };
  let orderByFrag = orderByMapping[orderby] || " ORDER BY ab.ab_id DESC ";

  // 取得總筆數
  const t_sql = `SELECT COUNT(1) totalRows FROM address_book ab ${sqlWhere}`;
  const [[{ totalRows }]] = await pool.query(t_sql);
  output.totalRows = totalRows;

  // 計算分頁資訊
  let totalPages = Math.ceil(totalRows / perPage);
  output.totalPages = totalPages;

  if (totalRows > 0) {
    if (page > totalPages) {
      output.redirect = `?page=${totalPages}`;
      return output;
    }

    // 主要資料查詢（包含收藏狀態）
    const sql = `SELECT ab.*, li.like_id FROM address_book ab
      LEFT JOIN (
        SELECT like_id, ab_id FROM ab_likes WHERE member_id=${member_id}
        ) li
      ON ab.ab_id=li.ab_id
    ${sqlWhere} ${orderByFrag} LIMIT ${(page - 1) * perPage}, ${perPage}`;

    const [rows] = await pool.query(sql);

    // 日期格式化處理
    rows.forEach((v) => {
      const m = moment(v.birthday);
      v.birthday = m.isValid() ? m.format("YYYY-MM-DD") : "";
    });

    output.rows = rows;
  }

  output.success = true;
  return output;
};

// 取得單筆資料
const getItemData = async (req) => {
  const output = {
    success: false,
    data: {},
    code: 0,
    message: "",
  };

  const ab_id = +req.params.ab_id || 0;
  if (!ab_id) {
    return { ...output, code: 400, message: "錯誤的編號" };
  }

  // 讀取資料
  const sql = "SELECT * FROM address_book WHERE ab_id=?";
  const [rows] = await pool.query(sql, [ab_id]);

  if (rows.length === 0) {
    return { ...output, code: 404, message: "沒有該筆資料" };
  }

  // 格式化生日欄位
  const m = moment(rows[0].birthday);
  rows[0].birthday = m.isValid() ? m.format("YYYY-MM-DD") : "";

  return { ...output, code: 200, success: true, data: rows[0] };
};

// 列表頁面
router.get("/", async (req, res) => {
  res.locals.pageTitle = "通訊錄列表";
  res.locals.pageName = "ab-list";

  const data = await getListData(req);

  // 處理重新導向（頁碼超出範圍）
  if (data.redirect) {
    return res.redirect(data.redirect);
  }

  // 根據使用者權限渲染不同模板
  if (req.session.admin) {
    res.render("address-book/list", data);
  } else {
    res.render("address-book/list-no-admin", data);
  }
});

// 新增表單頁面
router.get("/add", async (req, res) => {
  res.locals.pageTitle = "新增通訊錄";
  res.locals.pageName = "ab-add";
  res.render("address-book/add");
});

// 修改資料的表單頁
router.get("/edit/:ab_id", async (req, res) => {
  res.locals.pageTitle = "編輯通訊錄";
  res.locals.pageName = "ab-edit";

  const item = await getItemData(req);
  if (!item.success) {
    return res.redirect("/address-book"); // 沒取到資料，回列表頁
  }

  res.render("address-book/edit", item.data);
});

// 列表資料 API
router.get("/api", async (req, res) => {
  const data = await getListData(req);
  res.json(data);
});

// 切換收藏狀態（需登入）
router.post("/api/toggle-like/:ab_id", async (req, res) => {
  let output = {
    success: false,
    action: "",
    ab_id: req.params.ab_id,
  };

  // 檢查會員是否已登入
  const member_id = getMemberId(req);
  if (!member_id) {
    return res.status(403).json({ ...output, message: "沒有登入" });
  }

  // 執行收藏 / 取消收藏邏輯
  const sql = "SELECT * FROM ab_likes WHERE member_id=? AND ab_id=?";
  const [rows] = await pool.query(sql, [member_id, req.params.ab_id]);

  if (rows.length) {
    // 原本已收藏，執行移除
    output.action = "remove";
    const sql = "DELETE FROM ab_likes WHERE like_id=?";
    const [result] = await pool.query(sql, [rows[0].like_id]);
    output.success = !!result.affectedRows;
  } else {
    // 原本未收藏，執行加入
    const sql = "INSERT INTO ab_likes (member_id, ab_id) VALUES (?,?)";
    const [result] = await pool.query(sql, [member_id, req.params.ab_id]);
    output.action = "add";
    output.success = !!result.affectedRows;
  }

  res.json(output);
});

// 新增資料 API
router.post("/api", upload.none(), async (req, res) => {
  const output = {
    success: false,
    bodyData: req.body,
    insertId: 0,
    issues: [],
  };

  let { name, email, mobile, birthday, address } = req.body;

  // 資料驗證
  const zodResult = abItemSchema.safeParse({
    name,
    email,
    mobile,
    birthday,
    address,
  });

  if (!zodResult.success) {
    if (zodResult.error?.issues?.length) {
      output.issues = zodResult.error.issues;
    }
    return res.status(400).json(output);
  }

  // 處理空值的生日欄位
  if (!birthday) {
    birthday = null;
  }

  const sql = "INSERT INTO `address_book` SET ?";

  try {
    const [result] = await pool.query(sql, [
      { name, email, mobile, birthday, address },
    ]);
    output.success = !!result.affectedRows;
    if (output.success) {
      res.status(201);
      output.insertId = result.insertId;
    }
  } catch (ex) {
    console.log(ex);
    res.status(400);
  }

  res.json(output);
});

// 修改資料
router.put("/api/:ab_id", upload.none(), async (req, res) => {
  const output = {
    success: false,
    bodyData: req.body,
    issues: [],
  };

  // 取得未修改前的資料
  const ori = await getItemData(req);
  if (!ori.success) {
    return res.status(404).json(output);
  }

  const ab_id = ori.data.ab_id;
  let { name, email, mobile, birthday, address } = req.body;

  // 資料驗證
  const zodResult = abItemSchema.safeParse({
    name,
    email,
    mobile,
    birthday,
    address,
  });

  if (!zodResult.success) {
    if (zodResult.error?.issues?.length) {
      output.issues = zodResult.error.issues;
    }
    return res.status(400).json(output);
  }

  // 處理空值的生日欄位
  if (!birthday) {
    birthday = null;
  }

  const sql = "UPDATE `address_book` SET ? WHERE ab_id=?";

  try {
    const [result] = await pool.query(sql, [
      { name, email, mobile, birthday, address },
      ab_id,
    ]);

    // 使用 changedRows 判斷是否真的有修改
    output.success = !!result.changedRows;

    if (output.success) {
      res.status(200);
    }
  } catch (ex) {
    console.log(ex);
    res.status(400);
  }

  res.json(output);
});

// 批次刪除（須定義在 /api/:ab_id 之前，否則 del_many 會被當成 ab_id）
router.delete("/api/del_many", upload.none(), async (req, res) => {
  const output = {
    success: false,
    affectedRows: 0,
  };

  // 檢查參數
  if (!req.body.i || !req.body.i.length) {
    return res.status(400).json(output);
  }

  // 防範 SQL injection
  const items = req.body.i.map((item) => pool.escape(item));

  const sql = `DELETE FROM address_book WHERE ab_id IN (${items.join(",")})`;
  const [result] = await pool.query(sql);

  output.affectedRows = result.affectedRows;
  output.success = !!result.affectedRows;

  res.json(output);
});

// 刪除單筆資料
router.delete("/api/:ab_id", async (req, res) => {
  const ori = await getItemData(req); // 取得未修改前的資料

  if (!ori.success) {
    return res.status(404).json({ success: false });
  }

  const sql = "DELETE FROM address_book WHERE ab_id=?";
  const [result] = await pool.query(sql, [ori.data.ab_id]);

  res.json({ success: !!result.affectedRows });
});

// 單筆資料 API
router.get("/api/:ab_id", async (req, res) => {
  const item = await getItemData(req);
  res.status(item.code).json(item);
});

export default router;
export { getListData, getItemData, getMemberId };
