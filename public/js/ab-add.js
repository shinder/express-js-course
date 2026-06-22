// public/js/ab-add.js - 新增通訊錄表單處理（依賴 app.js）

const sendData = async (e) => {
  e.preventDefault();

  // 清除之前的錯誤狀態
  clearErrors();

  // 收集表單資料
  const fd = new FormData(document.form1);

  try {
    // 使用統一的 API 請求函式
    const obj = await apiRequest(
      '/address-book/api',
      { method: 'POST', body: fd },
      '新增聯絡人'
    );

    if (obj.success) {
      // 新增成功
      document.form1.reset();
      showSuccessMessage('聯絡人新增成功！');
    } else {
      // 處理驗證錯誤
      if (obj.issues?.length) {
        obj.issues.forEach((issue) => {
          const name = issue.path[0];
          const msg = issue.message;
          const field = document.form1[name];
          const errorText = field.nextElementSibling;
          errorText.innerHTML = msg;
          field.classList.add('is-invalid');
        });
      }
    }
  } catch (error) {
    // 錯誤已由 apiRequest 處理
  }
};

function clearErrors() {
  document.querySelectorAll('.form-control').forEach((field) => {
    field.classList.remove('is-invalid');
  });
  document.querySelectorAll('.invalid-feedback').forEach((text) => {
    text.innerHTML = '';
  });
}
