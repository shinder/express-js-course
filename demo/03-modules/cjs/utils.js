// utils.js - CommonJS 匯出多個函式
function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

// 整體匯出（講義中另列出「逐一匯出」與「匯出單一功能」兩種寫法，三者擇一使用）
module.exports = {
    add,
    multiply,
};
