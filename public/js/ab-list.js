// public/js/ab-list.js - 通訊錄列表頁互動功能（依賴 app.js）

// 刪除單一項目
const deleteItem = async (e, ab_id) => {
  e.preventDefault();

  try {
    const result = await apiRequest(
      `/address-book/api/${ab_id}`,
      { method: 'DELETE' },
      '刪除聯絡人'
    );

    if (result.success) {
      showSuccessMessage('聯絡人已成功刪除');
      setTimeout(() => location.reload(), 1000);
    }
  } catch (error) {
    // 錯誤已由 apiRequest 處理
  }
};

// 收藏功能切換
const toggleLike = async (e) => {
  const t = e.currentTarget;
  const tr = t.closest('tr');
  const ab_id = tr.getAttribute('data-ab_id');

  try {
    const result = await apiRequest(
      `/address-book/api/toggle-like/${ab_id}`,
      { method: 'POST' },
      '切換收藏狀態'
    );

    if (result.success) {
      if (result.action === 'add') {
        t.classList.add('liked');
        showSuccessMessage('已加入收藏', 1500);
      } else {
        t.classList.remove('liked');
        showSuccessMessage('已取消收藏', 1500);
      }
    }
  } catch (error) {
    // 錯誤已由 apiRequest 處理
  }
};

// 全選/取消全選
const toggleAll = (e) => {
  document.querySelectorAll('.del_item').forEach((item) => {
    item.checked = e.target.checked;
  });
};

// 批次刪除
const deleteSelected = async (e) => {
  const checkedItems = document.querySelectorAll('.del_item:checked');

  if (checkedItems.length === 0) {
    handleApiError('請至少選擇一個要刪除的項目', '批次刪除');
    return;
  }

  const fd = new FormData();
  checkedItems.forEach((item) => {
    const ab_id = item.closest('tr').getAttribute('data-ab_id');
    fd.append('i[]', ab_id);
  });

  try {
    const result = await apiRequest(
      `/address-book/api/del_many`,
      { method: 'DELETE', body: fd },
      '批次刪除聯絡人'
    );

    if (result.success) {
      showSuccessMessage(`已成功刪除 ${checkedItems.length} 個聯絡人`);
      setTimeout(() => location.reload(), 1000);
    }
  } catch (error) {
    // 錯誤已由 apiRequest 處理
  }
};
