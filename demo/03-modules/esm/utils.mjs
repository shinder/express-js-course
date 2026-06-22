// utils.mjs - 具名匯出（一般匯出）
export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

export const PI = 3.14159;

// 預設匯出
export default function subtract(a, b) {
    return a - b;
}
