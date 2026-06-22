// public/js/login.js - 登入表單處理

const errorModalEl = document.getElementById('errorModal');
const errorModal = bootstrap.Modal.getOrCreateInstance(errorModalEl);
const errorMessage = document.getElementById('errorMessage');

const sendData = (e) => {
  e.preventDefault();

  // 收集表單資料
  const fd = new FormData(document.form1);

  // 發送登入請求
  fetch('/login', {
    method: 'POST',
    body: fd,
  })
    .then((r) => r.json())
    .then((obj) => {
      console.log(obj);
      if (obj.success) {
        // 登入成功，跳轉到原來的頁面或首頁
        location.href = document.referrer || '/';
      } else {
        // 登入失敗，顯示錯誤訊息
        let message = '帳號或密碼錯誤';
        if (obj.code === 12) {
          message = '帳號不存在';
        } else if (obj.code === 34) {
          message = '密碼錯誤';
        }
        errorMessage.textContent = message;
        errorModal.show();
      }
    })
    .catch((error) => {
      console.warn(error);
      errorMessage.textContent = '登入時發生錯誤，請稍後再試';
      errorModal.show();
    });
};
