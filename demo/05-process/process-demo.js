// process-demo.js
// process 是 Node.js 的全域物件，代表目前執行的 Node.js 行程
// 執行方式：node process-demo.js
//          node process-demo.js --exit       （測試 process.exit）
//          PORT=3001 NODE_ENV=development node process-demo.js
console.log('Node.js 版本：', process.version);
console.log('作業系統：', process.platform);
console.log('行程 PID：', process.pid);
console.log('工作目錄：', process.cwd());

// 環境變數
console.log('PORT 環境變數：', process.env.PORT);
console.log('NODE_ENV：', process.env.NODE_ENV);

// 命令列參數
// process.argv[0] 是 node 執行檔路徑，[1] 是腳本路徑，之後才是使用者傳入的參數
console.log('命令列參數：', process.argv);

// 退出行程
if (process.argv.includes('--exit')) {
  console.log('行程即將退出...');
  process.exit(0);
}
