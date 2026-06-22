// http-readfile-demo.js - 使用 async/await：先寫入檔案，確認完成後再讀取
// 執行方式：node http-readfile-demo.js
import http from "node:http";
import fs from "node:fs/promises";

const server = http.createServer(async (req, res) => {
  try {
    // 步驟 1: 先寫入檔案
    await fs.writeFile("headers.txt", JSON.stringify(req.headers, null, 2));
    console.log("HTTP 標頭已儲存");

    // 步驟 2: 再讀取檔案（確保寫入完成後才讀取）
    const data = await fs.readFile("headers.txt", "utf-8");

    // 步驟 3: 回應用戶端
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(data);

  } catch (error) {
    console.error("檔案操作錯誤:", error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("伺服器內部錯誤");
  }
});

server.listen(3000, () => {
  console.log("伺服器已啟動：http://localhost:3000");
});
