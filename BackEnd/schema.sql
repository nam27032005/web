-- EasyAccomod Schema & Seed Data
CREATE DATABASE IF NOT EXISTS easy_accomod;
USE easy_accomod;

-- =====================
-- 0. DROP TABLES (for clean reset)
-- =====================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_conversations`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `otps`;
SET FOREIGN_KEY_CHECKS = 1;


-- =====================
-- 1. CREATE TABLES
-- =====================

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `gender` ENUM('nam', 'nữ', 'khác'),
  `address` VARCHAR(255),
  `avatar` LONGTEXT,
  `role` ENUM('admin', 'owner', 'renter') DEFAULT 'renter',
  `verified` BOOLEAN DEFAULT FALSE,
  `ownerVerified` BOOLEAN DEFAULT FALSE,
  `active` BOOLEAN DEFAULT TRUE,
  `favorites` JSON,
  `resetPasswordToken` VARCHAR(255),
  `resetPasswordExpires` DATETIME,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ownerId` INT NOT NULL,
  `ownerName` VARCHAR(255),
  `ownerPhone` VARCHAR(50),
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(12,0) NOT NULL,
  `area` FLOAT,
  `roomType` ENUM('phong_tro', 'chung_cu_mini', 'nha_nguyen_can', 'chung_cu_nguyen_can') DEFAULT 'phong_tro',
  `status` ENUM('available', 'rented') DEFAULT 'available',
  `postStatus` ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  `address_street` VARCHAR(255),
  `address_ward` VARCHAR(100),
  `address_district` VARCHAR(100),
  `address_city` VARCHAR(100),
  `address_full` VARCHAR(500),
  `latitude` FLOAT,
  `longitude` FLOAT,
  `nearBy` JSON,
  `amenities` JSON,
  `images` JSON,
  `roomCount` INT DEFAULT 1,
  `priceUnit` ENUM('month', 'quarter', 'year') DEFAULT 'month',
  `sharedOwner` BOOLEAN DEFAULT FALSE,
  `bathroom_type` ENUM('private', 'shared') DEFAULT 'private',
  `bathroom_hasHotWater` BOOLEAN DEFAULT FALSE,
  `kitchen` ENUM('private', 'shared', 'none') DEFAULT 'private',
  `hasAC` BOOLEAN DEFAULT FALSE,
  `hasBalcony` BOOLEAN DEFAULT FALSE,
  `electricityPrice` ENUM('standard', 'rental') DEFAULT 'standard',
  `electricityRate` DECIMAL(10,2),
  `waterRate` DECIMAL(10,2),
  `postFee` DECIMAL(12,0) DEFAULT 0,
  `views` INT DEFAULT 0,
  `favorites` INT DEFAULT 0,
  `displayDuration` INT DEFAULT 1,
  `displayDurationUnit` ENUM('day', 'week', 'month') DEFAULT 'month',
  `expiresAt` DATETIME,
  `approvedAt` DATETIME,
  `rejectReason` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
CREATE INDEX idx_owner_createdAt ON rooms(ownerId, createdAt);
CREATE INDEX idx_postStatus ON rooms(postStatus);

CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `userName` VARCHAR(255),
  `userAvatar` LONGTEXT,
  `userGender` ENUM('nam', 'nữ', 'khác') DEFAULT 'nam',
  `rating` INT NOT NULL,
  `comment` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roomId` INT NOT NULL,
  `reporterId` INT NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT,
  `type` ENUM('system', 'message', 'approval', 'renewal') DEFAULT 'system',
  `read` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `chat_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user1Id` INT NOT NULL,
  `user2Id` INT NOT NULL,
  `roomId` INT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user1Id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user2Id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE SET NULL
);

CREATE TABLE `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversationId` INT NOT NULL,
  `senderId` INT NOT NULL,
  `receiverId` INT NOT NULL,
  `content` TEXT,
  `read` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversationId`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `otps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =====================
-- 2. SEED USERS (1 admin, 2 owners, 2 renters)
-- Password: 123456 (bcrypt)
-- =====================
INSERT INTO `users` (`id`, `role`, `name`, `email`, `password`, `phone`, `gender`, `address`, `verified`) VALUES
(1, 'admin',  'Nguyễn Quản Trị',  'admin@easyaccomod.vn',   '$2a$10$4odXQIWEU/mt8Fyrc2oIkOIdV7N20/KmihG0bwSfVbbxo8j2OTZiq', '0901000001', 'nam',  'Hà Nội', TRUE),
(2, 'owner',  'Trần Văn Minh',    'owner1@gmail.com',        '$2a$10$4odXQIWEU/mt8Fyrc2oIkOIdV7N20/KmihG0bwSfVbbxo8j2OTZiq', '0912345678', 'nam',  '123 Lê Lợi, Q.1, TP.HCM', TRUE),
(3, 'owner',  'Lê Thị Hoa',       'owner2@gmail.com',        '$2a$10$4odXQIWEU/mt8Fyrc2oIkOIdV7N20/KmihG0bwSfVbbxo8j2OTZiq', '0923456789', 'nữ',   '45 Nguyễn Huệ, Q.1, TP.HCM', TRUE),
(4, 'renter', 'Phạm Thành Long',  'renter1@gmail.com',       '$2a$10$4odXQIWEU/mt8Fyrc2oIkOIdV7N20/KmihG0bwSfVbbxo8j2OTZiq', '0934567890', 'nam',  '78 Bà Triệu, Hai Bà Trưng, Hà Nội', TRUE),
(5, 'renter', 'Nguyễn Thị Mai',   'renter2@gmail.com',       '$2a$10$4odXQIWEU/mt8Fyrc2oIkOIdV7N20/KmihG0bwSfVbbxo8j2OTZiq', '0945678901', 'nữ',   '12 Đinh Tiên Hoàng, Q.1, TP.HCM', TRUE);

-- =====================
-- 3. SEED ROOMS (5 phòng diverse)
-- =====================
INSERT INTO `rooms` (`id`, `ownerId`, `ownerName`, `ownerPhone`, `title`, `description`, `address_street`, `address_ward`, `address_district`, `address_city`, `address_full`, `roomType`, `price`, `area`, `bathroom_type`, `bathroom_hasHotWater`, `kitchen`, `hasAC`, `hasBalcony`, `electricityPrice`, `electricityRate`, `waterRate`, `amenities`, `images`, `status`, `postStatus`, `displayDuration`, `displayDurationUnit`, `postFee`, `approvedAt`, `expiresAt`) VALUES
(1, 2, 'Trần Văn Minh', '0912345678',
 'Phòng trọ giá rẻ Q.Bình Thạnh, full nội thất',
 'Phòng sạch sẽ, thoáng mát, an ninh tốt, gần trường ĐH. Có wifi miễn phí, tủ lạnh, máy giặt chung.',
 '15 Nơ Trang Long', 'Phường 13', 'Bình Thạnh', 'TP.HCM',
 '15 Nơ Trang Long, Phường 13, Bình Thạnh, TP.HCM',
 'phong_tro', 2800000, 22, 'shared', TRUE, 'shared', TRUE, FALSE,
 'rental', 3500, 80000,
 '["wifi","tủ lạnh","máy giặt chung","bảo vệ 24/7"]',
 '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1502672260266-1c15a15324ec?auto=format&fit=crop&q=80&w=800"]',
 'available', 'approved', 1, 'month', 99000,
 NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)),

(2, 2, 'Trần Văn Minh', '0912345678',
 'Chung cư mini Q.7 có thang máy, nội thất đầy đủ',
 'Căn hộ mini cao cấp, thang máy, hồ bơi, gym. Phù hợp cặp đôi hoặc ở đơn.',
 '102 Nguyễn Thị Thập', 'Phường Tân Phú', 'Quận 7', 'TP.HCM',
 '102 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM',
 'chung_cu_mini', 5500000, 35, 'private', TRUE, 'private', TRUE, TRUE,
 'standard', NULL, 90000,
 '["wifi","điều hòa","bếp riêng","thang máy","hồ bơi","gym"]',
 '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&q=80&w=800"]',
 'available', 'approved', 1, 'month', 199000,
 NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)),

(3, 3, 'Lê Thị Hoa', '0923456789',
 'Phòng trọ Cầu Giấy Hà Nội, gần ĐH Quốc Gia',
 'Phòng rộng rãi, yên tĩnh, gần trường ĐH Quốc Gia, ĐH Công Nghệ. Giờ giấc tự do.',
 '67 Xuân Thủy', 'Phường Dịch Vọng', 'Cầu Giấy', 'Hà Nội',
 '67 Xuân Thủy, Phường Dịch Vọng, Cầu Giấy, Hà Nội',
 'phong_tro', 3200000, 25, 'private', TRUE, 'shared', TRUE, FALSE,
 'rental', 3800, 80000,
 '["wifi","điều hòa","tủ lạnh","gần trường"]',
 '["https://plus.unsplash.com/premium_photo-1661877303180-19a028c21048?auto=format&fit=crop&q=80&w=800"]',
 'available', 'approved', 1, 'month', 99000,
 NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)),
 
(4, 3, 'Lê Thị Hoa', '0923456789',
 'Nhà nguyên căn Đống Đa, 3 phòng ngủ, sân để xe',
 'Nhà nguyên căn 3 tầng, 3PN, 2WC, sân rộng để xe ô tô, phù hợp gia đình hoặc nhóm bạn.',
 '8 Nguyễn Lương Bằng', 'Phường Quang Trung', 'Đống Đa', 'Hà Nội',
 '8 Nguyễn Lương Bằng, Phường Quang Trung, Đống Đa, Hà Nội',
 'nha_nguyen_can', 12000000, 90, 'private', TRUE, 'private', FALSE, TRUE,
 'standard', NULL, 120000,
 '["sân để xe","3 phòng ngủ","2 nhà vệ sinh","sân vườn"]',
 '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"]',
 'available', 'pending', 3, 'month', 299000,
 NULL, NULL),

(5, 2, 'Trần Văn Minh', '0912345678',
 'Chung cư nguyên căn Thủ Đức, view đẹp, tầng cao',
 'Căn hộ 2PN tầng 15, view sông, đầy đủ nội thất cao cấp, an ninh 24/7.',
 '201 Võ Văn Ngân', 'Phường Bình Thọ', 'Thủ Đức', 'TP.HCM',
 '201 Võ Văn Ngân, Phường Bình Thọ, Thủ Đức, TP.HCM',
 'chung_cu_nguyen_can', 9500000, 68, 'private', TRUE, 'private', TRUE, TRUE,
 'standard', NULL, 100000,
 '["wifi","điều hòa","bếp riêng","thang máy","bảo vệ 24/7","view sông"]',
 '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800"]',
 'available', 'approved', 1, 'month', 199000,
 NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH));

-- =====================
-- 4. SEED REVIEWS (5 đánh giá)
-- =====================
INSERT INTO `reviews` (`roomId`, `userId`, `userName`, `userAvatar`, `rating`, `comment`, `status`) VALUES
(1, 4, 'Phạm Thành Long',  NULL, 5, 'Phòng rất sạch sẽ, chủ nhà thân thiện, giá hợp lý. Mình ở được 6 tháng rồi, rất hài lòng!', 'approved'),
(2, 5, 'Nguyễn Thị Mai',   NULL, 4, 'Căn hộ đẹp, đầy đủ tiện nghi. Chỉ hơi ồn vào buổi sáng do gần đường lớn.', 'approved'),
(3, 4, 'Phạm Thành Long',  NULL, 5, 'Gần trường, điện nước rõ ràng, hàng xóm tốt. Chủ nhà rất dễ tính.', 'approved'),
(4, 5, 'Nguyễn Thị Mai',   NULL, 3, 'Nhà rộng nhưng hơi cũ, cần sửa chữa một số chỗ. Giá thì ổn cho gia đình.', 'approved'),
(5, 4, 'Phạm Thành Long',  NULL, 5, 'View sông tuyệt đẹp, an ninh tốt, gần trường. Xứng đáng từng đồng!', 'approved');

-- =====================
-- 5. SEED NOTIFICATIONS (5 thông báo)
-- =====================
INSERT INTO `notifications` (`userId`, `title`, `message`, `read`, `type`) VALUES
(2, 'Bài đăng được duyệt', 'Bài đăng "Phòng trọ giá rẻ Q.Bình Thạnh" của bạn đã được duyệt thành công.', FALSE, 'approval'),
(3, 'Bài đăng được duyệt', 'Bài đăng "Phòng trọ Cầu Giấy Hà Nội" của bạn đã được duyệt thành công.', FALSE, 'approval'),
(4, 'Chào mừng đến EasyAccomod!', 'Tài khoản của bạn đã được xác thực. Hãy bắt đầu tìm kiếm phòng trọ phù hợp!', TRUE, 'system'),
(5, 'Chào mừng đến EasyAccomod!', 'Tài khoản của bạn đã được xác thực. Hãy khám phá hàng nghìn phòng trọ trên hệ thống!', TRUE, 'system'),
(2, 'Sắp hết hạn bài đăng', 'Bài đăng "Chung cư mini Q.7" sẽ hết hạn trong 7 ngày. Hãy gia hạn để tiếp tục hiển thị.', FALSE, 'renewal');

-- =====================
-- 6. SEED REPORTS (5 báo cáo)
-- =====================
INSERT INTO `reports` (`roomId`, `reporterId`, `reason`, `description`, `status`) VALUES
(1, 5, 'Thông tin sai lệch', 'Hình ảnh đăng tải không khớp với thực tế phòng trọ, phòng nhỏ hơn nhiều so với mô tả.', 'pending'),
(2, 4, 'Giá không đúng', 'Giá thực tế khi liên hệ cao hơn so với giá đăng trên hệ thống.', 'resolved'),
(3, 5, 'Phòng đã cho thuê', 'Phòng này đã có người thuê nhưng vẫn hiển thị trạng thái còn trống.', 'pending'),
(4, 4, 'Liên hệ không được', 'Số điện thoại chủ nhà không liên lạc được, đã thử nhiều lần.', 'resolved'),
(5, 5, 'Nội dung không phù hợp', 'Mô tả phòng có một số thông tin gây hiểu nhầm về vị trí thực tế.', 'pending');
