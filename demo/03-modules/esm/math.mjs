// math.mjs - 混合匯出方式
const square = (x) => x * x;
const cube = (x) => x * x * x;

// 具名匯出
export { square };
export const f1 = (a) => a * a;

// 預設匯出
export default cube;
