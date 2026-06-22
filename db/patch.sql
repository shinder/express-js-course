-- 匯入 shin01pma.sql 後執行的修補
-- 使用方式：mysql -uroot -proot -h 127.0.0.1 < db/patch.sql
--
-- 官方 dump 的 created_at / create_at 為 NOT NULL 但未帶預設值，
-- 而講義的 INSERT 多半省略這些欄位（期望由資料庫自動填入時間），
-- 故補上 DEFAULT CURRENT_TIMESTAMP（與講義單元十七列出的 schema 一致）。

USE `shin01`;

ALTER TABLE `address_book`
  MODIFY `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `members`
  MODIFY `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP;
