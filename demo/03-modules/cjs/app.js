// app.js - 匯入和使用模組
// 執行方式：node app.js
// 本資料夾的 package.json 設定 "type": "commonjs"，故 .js 以 CJS 執行
const { add, multiply } = require('./utils'); // 解構匯入（CJS 可省略副檔名）

console.log(add(5, 3));      // 8
console.log(multiply(4, 6)); // 24
