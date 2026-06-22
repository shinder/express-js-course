// public/js/app.js - 全站共用前端工具

// 統一的 API 呼叫函式
async function apiRequest(url, options = {}, context = '操作') {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.warn(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success === false) {
      console.warn(data.message || `${context}失敗`);
    }

    return data;
  } catch (error) {
    handleApiError(error, context);
    throw error;
  }
}

// 統一的錯誤處理函式
function handleApiError(error, context = '操作') {
  // 容許傳入字串或 Error 物件，避免 error.message 為 undefined
  if (typeof error === 'string') error = new Error(error);
  console.error(`${context}錯誤:`, error);

  // 建立 Bootstrap 錯誤 modal（若尚未存在）
  let modalEl = document.getElementById('errorModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'errorModal';
    modalEl.className = 'modal fade';
    modalEl.setAttribute('tabindex', '-1');
    modalEl.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">操作失敗</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger mb-0">
              <span id="errorMessage"></span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">確定</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  let message = `${context}失敗，請稍後再試`;

  if (error.message) {
    if (error.message.includes('fetch')) {
      message = '網路連線錯誤，請檢查網路連線';
    } else if (error.message.includes('JSON')) {
      message = '伺服器回應格式錯誤';
    } else {
      message = error.message;
    }
  }

  document.getElementById('errorMessage').textContent = message;
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// 統一的成功提示函式
function showSuccessMessage(message, autoClose = 3000) {
  const container = document.createElement('div');
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  container.innerHTML = `
    <div class="toast align-items-center text-bg-success border-0 show" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  if (autoClose > 0) {
    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, autoClose);
  }

  return container;
}
