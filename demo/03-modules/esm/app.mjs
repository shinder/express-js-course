// app.mjs - 匯入和使用模組
// 執行方式：node app.mjs
import subtract, { add, multiply, PI } from './utils.mjs'; // 混合匯入
import cube, { square, f1 as newName } from './math.mjs'; // 別名匯入

console.log(add(5, 3)); // 8
console.log(subtract(10, 4)); // 6
console.log(multiply(2, PI)); // 6.28318
console.log(square(4)); // 16
console.log(cube(3)); // 27
console.log(newName(6)); // 36 (f1 的別名)
