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

// 取得目前登入會員的 id（尚未登入則為 0）
const getMemberId = (req) => (req.session.admin ? +req.session.admin.member_id : 0);

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
  const output = { success: false, code: 0, data: {} };
  const ab_id = +req.params.ab_id || 0;
  if (!ab_id) {
    output.code = 400;
    return output;
  }
  const [rows] = await pool.query("SELECT * FROM address_book WHERE ab_id=?", [ab_id]);
  if (!rows.length) {
    output.code = 404;
    return output;
  }
  const row = rows[0];
  const m = moment(row.birthday);
  row.birthday = m.isValid() ? m.format("YYYY-MM-DD") : "";
  output.data = row;
  output.success = true;
  output.code = 200;
  return output;
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

// 列表資料 API
router.get("/api", async (req, res) => {
  const data = await getListData(req);
  res.json(data);
});

// 切換收藏狀態
router.post("/api/toggle-like/:ab_id", async (req, res) => {
  const output = { success: false, action: "", error: "" };
  const member_id = getMemberId(req);
  // 收藏功能需登入（ab_likes.member_id 對 members 有外鍵約束）
  if (!member_id) {
    output.error = "請先登入";
    return res.status(401).json(output);
  }
  const ab_id = +req.params.ab_id || 0;
  if (!ab_id) {
    output.error = "缺少 ab_id";
    return res.json(output);
  }

  // 檢查是否已收藏
  const [rows] = await pool.query(
    "SELECT * FROM ab_likes WHERE member_id=? AND ab_id=?",
    [member_id, ab_id]
  );
  if (rows.length) {
    await pool.query("DELETE FROM ab_likes WHERE member_id=? AND ab_id=?", [
      member_id,
      ab_id,
    ]);
    output.action = "remove";
  } else {
    await pool.query("INSERT INTO ab_likes (member_id, ab_id) VALUES (?, ?)", [
      member_id,
      ab_id,
    ]);
    output.action = "add";
  }
  output.success = true;
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

// 單筆資料 API
router.get("/api/:ab_id", async (req, res) => {
  const item = await getItemData(req);
  res.status(item.code).json(item);
});

export default router;
export { getListData, getItemData, getMemberId };
