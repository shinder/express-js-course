// http-file-demo.js - 使用 fs/promises 的正確作法
// 執行方式：node http-file-demo.js，每次請求會把請求資訊附加寫入 logs/ 目錄
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const server = http.createServer(async (req, res) => {
  try {
    // 記錄請求資訊
    const requestInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: req.headers,
      userAgent: req.headers['user-agent']
    };

    const jsonStr = JSON.stringify(requestInfo, null, 2);

    // 確保 logs 目錄存在
    await fs.mkdir("./logs", { recursive: true });

    // 寫入日誌檔案
    const logFile = `./logs/request-${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(logFile, jsonStr + '\n', { flag: 'a' }); // 'a' 表示附加模式

    // 回應 HTTP 請求
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify({
      message: "請求已記錄",
      logFile: logFile,
      requestInfo: requestInfo
    }, null, 2));

  } catch (error) {
    console.error('檔案操作錯誤:', error);
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "伺服器內部錯誤" }));
  }
});

server.listen(3000, () => {
  console.log('伺服器已啟動：http://localhost:3000');
});
