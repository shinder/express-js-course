// routes/member.js
import express from "express";
const router = express.Router();

router
  .route("/member/edit/:id")
  .all((req, res, next) => {
    // GET / POST 共用的前置處理
    res.locals.memberData = { name: "shinder", id: "A002" };
    next();
  })
  .get((req, res) => {
    res.json({ method: "GET", data: res.locals.memberData });
  })
  .post((req, res) => {
    res.json({ method: "POST", data: res.locals.memberData });
  });

export default router;
