// 檔案: utils/upload-images.js
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// 1. 接受的圖片 MIME → 副檔名對照表
const extMap = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

// 2. 篩選檔案：不在白名單內的會被拒絕
function fileFilter(req, file, callback) {
  callback(null, !!extMap[file.mimetype]);
}

// 3. 自訂儲存位置與檔名（避免使用者上傳同名檔案互相覆蓋）
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/images"); // 第一個參數 null 表示沒有錯誤
  },
  filename: (req, file, callback) => {
    const f = uuidv4() + extMap[file.mimetype];
    callback(null, f);
  },
});

export default multer({ fileFilter, storage });
