-- 通訊錄資料庫 schema 與種子資料
-- 使用方式：mysql -uroot -proot -h 127.0.0.1 < db/address_book.sql

CREATE DATABASE IF NOT EXISTS `proj57`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `proj57`;

DROP TABLE IF EXISTS `address_book`;
CREATE TABLE `address_book` (
  `sid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(255) NOT NULL,
  -- 講義原始 schema 為 NOT NULL，但 /try-db2 測試插入時省略 birthday，
  -- 為了讓各種插入路徑都能運作，這裡放寬為可為 NULL
  `birthday` date DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `address_book`
(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES
('李小明', 'ming01@gmail.com', '0918555666', '1995-10-02', '台南市東區', '2020-03-24 09:30:37'),
('王美麗', 'meili.wang@example.com', '0922123456', '1990-05-18', '台北市大安區', '2020-04-01 10:12:00'),
('陳大文', 'davidchen@example.com', '0933456789', '1988-12-25', '新北市板橋區', '2020-04-15 14:20:10'),
('林志玲', 'chiling.lin@example.com', '0911222333', '1992-07-07', '台中市西屯區', '2020-05-02 08:45:30'),
('張家豪', 'jiahao.chang@example.com', '0955666777', '1985-03-14', '高雄市左營區', '2020-05-20 16:05:00'),
('黃淑芬', 'shufen.huang@example.com', '0966888999', '1998-09-21', '桃園市中壢區', '2020-06-10 11:30:45'),
('吳俊傑', 'junjie.wu@example.com', '0977111222', '1993-11-11', '台南市永康區', '2020-06-25 13:15:20'),
('蔡英傑', 'yingjie.tsai@example.com', '0900333444', '1991-01-30', '新竹市東區', '2020-07-08 09:00:00'),
('鄭雅婷', 'yating.cheng@example.com', '0912888777', '1996-04-04', '台北市信義區', '2020-07-22 15:40:10'),
('謝宗翰', 'zonghan.hsieh@example.com', '0923555111', '1987-08-08', '台中市北區', '2020-08-05 10:25:35'),
('許文龍', 'wenlong.hsu@example.com', '0934222888', '1983-02-17', '彰化縣彰化市', '2020-08-19 14:50:00'),
('郭采潔', 'caijie.kuo@example.com', '0945777333', '1994-06-23', '高雄市三民區', '2020-09-01 08:30:25'),
('洪敏華', 'minhua.hung@example.com', '0956444666', '1990-10-10', '台南市中西區', '2020-09-15 17:10:40'),
('趙又廷', 'youting.chao@example.com', '0967333999', '1986-12-01', '台北市中山區', '2020-10-03 09:55:15'),
('周杰倫', 'jaychou@example.com', '0918666222', '1979-01-18', '新北市新店區', '2020-10-18 13:40:00'),
('蘇打綠', 'sodagreen@example.com', '0929111888', '1997-03-29', '台中市南屯區', '2020-11-02 11:20:30'),
('江蕙美', 'huimei.chiang@example.com', '0930888444', '1989-05-05', '嘉義市西區', '2020-11-20 16:35:50'),
('范逸臣', 'yichen.fan@example.com', '0941555999', '1984-07-19', '花蓮縣花蓮市', '2020-12-05 10:05:00'),
('潘瑋柏', 'will.pan@example.com', '0952222666', '1995-08-15', '台北市松山區', '2020-12-22 14:25:45'),
('曾國城', 'guocheng.tseng@example.com', '0963999111', '1982-09-09', '高雄市鳳山區', '2021-01-08 09:15:20'),
('彭于晏', 'eddie.peng@example.com', '0914777555', '1991-02-28', '屏東縣屏東市', '2021-01-25 13:50:30'),
('溫昇豪', 'shenghao.wen@example.com', '0925333777', '1980-11-22', '台中市西區', '2021-02-10 11:40:10'),
('葉舒華', 'shuhua.yeh@example.com', '0936666333', '2000-01-13', '台北市文山區', '2021-02-28 15:30:00'),
('馬國賢', 'guoxian.ma@example.com', '0947111999', '1978-04-06', '基隆市仁愛區', '2021-03-15 08:20:25'),
('盧廣仲', 'crowd.lu@example.com', '0958888222', '1985-06-30', '台南市安平區', '2021-04-01 17:45:15'),
('鄧紫棋', 'gem.tang@example.com', '0969444888', '1991-08-16', '台北市南港區', '2021-04-20 10:35:40'),
('簡嫚書', 'manshu.chien@example.com', '0915222444', '1993-10-27', '宜蘭縣宜蘭市', '2021-05-08 14:10:00'),
('魏如萱', 'waa.wei@example.com', '0926777111', '1982-12-12', '台中市東區', '2021-05-25 09:25:35');
