// routes/admin.js
import express from "express";
const router = express.Router();

router.get("/admin/:p1", (req, res) => {
  // url：路由相對於本 router 的路徑；originalUrl：完整原始路徑
  const { url, baseUrl, originalUrl, params } = req;
  res.json({ url, baseUrl, originalUrl, params });
});

export default router;
