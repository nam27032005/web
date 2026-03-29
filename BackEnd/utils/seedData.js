/**
 * Seed script: nhập dữ liệu mẫu từ mockData vào MongoDB
 * Chạy: node utils/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Room = require('../models/Room');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const ChatMessage = require('../models/ChatMessage');
const Report = require('../models/Report');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Xóa dữ liệu cũ
  await Promise.all([
    User.deleteMany(), Room.deleteMany(), Review.deleteMany(),
    Notification.deleteMany(), ChatMessage.deleteMany(), Report.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── USERS ──────────────────────────────────────────
  const users = await User.create([
    {
      role: 'admin', name: 'Nguyễn Admin',
      email: 'admin@7tro.vn', password: 'admin123',
      phone: '0901234567',
      avatar: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop',
      verified: true,
    },
    {
      role: 'owner', name: 'Trần Văn Minh',
      email: 'owner@test.vn', password: 'owner123',
      phone: '0912345678',
      avatar: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop',
      address: '123 Lê Văn Việt, Q9, TP.HCM', cccd: '012345678901', verified: true,
    },
    {
      role: 'owner', name: 'Lê Thị Hương',
      email: 'huong.owner@test.vn', password: 'owner123',
      phone: '0923456789',
      avatar: 'https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=200&h=200&fit=crop',
      address: '45 Nguyễn Trãi, Q5, TP.HCM', cccd: '012345678902', verified: false,
    },
    {
      role: 'owner', name: 'Phạm Quốc Tuấn',
      email: 'tuan.owner@test.vn', password: 'owner123',
      phone: '0934567890',
      avatar: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop',
      address: '78 Hoàng Diệu, Q4, TP.HCM', cccd: '012345678903', verified: true,
    },
    {
      role: 'renter', name: 'Nguyễn Thị Lan',
      email: 'renter@test.vn', password: 'renter123',
      phone: '0945678901',
      avatar: 'https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=200&h=200&fit=crop',
    },
    {
      role: 'renter', name: 'Hoàng Minh Khoa',
      email: 'khoa.renter@test.vn', password: 'renter123',
      phone: '0956789012',
      avatar: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop',
    },
  ]);

  const [admin, owner1, owner2, owner3, renter1, renter2] = users;
  console.log(`👤 Created ${users.length} users`);

  // ── ROOMS ──────────────────────────────────────────
  const rooms = await Room.create([
    {
      ownerId: owner1._id, ownerName: owner1.name, ownerPhone: owner1.phone,
      title: 'Phòng trọ đầy đủ nội thất, gần ĐH Bách Khoa',
      description: 'Phòng trọ mới xây, thoáng mát, có đầy đủ nội thất cơ bản. Khu vực an ninh, gần trường đại học Bách Khoa, thuận tiện đi lại.',
      address: { street: '120/5 Đinh Tiên Hoàng', ward: 'Phường 3', district: 'Quận Bình Thạnh', city: 'TP. Hồ Chí Minh', full: '120/5 Đinh Tiên Hoàng, Phường 3, Quận Bình Thạnh, TP. Hồ Chí Minh' },
      nearBy: ['ĐH Bách Khoa TP.HCM', 'Công viên Gia Định', 'UBND Quận Bình Thạnh'],
      roomType: 'phong_tro', roomCount: 1, price: 3500000, priceUnit: 'month', area: 25,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'shared', hasAC: true,
      electricityPrice: 'rental', electricityRate: 3500, waterRate: 80000,
      amenities: ['Tủ lạnh', 'Máy giặt chung'],
      images: ['https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 1, displayDurationUnit: 'month', postFee: 200000,
      views: 342, favorites: 28, approvedAt: new Date('2024-03-02'), expiresAt: new Date('2026-04-30'),
    },
    {
      ownerId: owner1._id, ownerName: owner1.name, ownerPhone: owner1.phone,
      title: 'Chung cư mini cao cấp, trung tâm Quận 1',
      description: 'Căn hộ chung cư mini hiện đại, full nội thất, view đẹp, an ninh 24/7. Vị trí trung tâm.',
      address: { street: '15 Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', full: '15 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh' },
      nearBy: ['Nhà hát Thành phố', 'Công viên 30/4', 'UBND Quận 1'],
      roomType: 'chung_cu_mini', roomCount: 1, price: 8000000, priceUnit: 'month', area: 40,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true, hasBalcony: true,
      electricityPrice: 'standard', amenities: ['Tủ lạnh', 'Máy giặt', 'Giường tủ'],
      images: ['https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 3, displayDurationUnit: 'month', postFee: 600000,
      views: 521, favorites: 67, approvedAt: new Date('2024-02-16'), expiresAt: new Date('2026-05-30'),
    },
    {
      ownerId: owner3._id, ownerName: owner3.name, ownerPhone: owner3.phone,
      title: 'Nhà nguyên căn 3 phòng ngủ, sân vườn rộng',
      description: 'Nhà nguyên căn 3 tầng, 3 phòng ngủ, 2 nhà vệ sinh, sân vườn. Thích hợp cho gia đình.',
      address: { street: '56 Lê Văn Việt', ward: 'Phường Hiệp Phú', district: 'Quận 9', city: 'TP. Hồ Chí Minh', full: '56 Lê Văn Việt, Phường Hiệp Phú, Quận 9, TP. Hồ Chí Minh' },
      nearBy: ['ĐH Công Nghệ Thông Tin', 'Trung tâm thể thao Phú Hữu'],
      roomType: 'nha_nguyen_can', roomCount: 3, price: 15000000, priceUnit: 'month', area: 120,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true, hasBalcony: true,
      electricityPrice: 'standard', amenities: ['Tủ lạnh', 'Máy giặt', 'Giường tủ'],
      images: ['https://images.unsplash.com/photo-1770462573891-ef8559618921?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 1, displayDurationUnit: 'quarter', postFee: 450000,
      views: 189, favorites: 15, approvedAt: new Date('2024-03-06'), expiresAt: new Date('2026-06-05'),
    },
    {
      ownerId: owner2._id, ownerName: owner2.name, ownerPhone: owner2.phone,
      title: 'Chung cư nguyên căn 2PN full nội thất, Q7',
      description: 'Chung cư cao cấp 2 phòng ngủ, đầy đủ nội thất, hồ bơi, gym.',
      address: { street: '89 Phạm Thái Bường', ward: 'Phường Tân Phong', district: 'Quận 7', city: 'TP. Hồ Chí Minh', full: '89 Phạm Thái Bường, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh' },
      nearBy: ['Trung tâm thể thao Phú Mỹ Hưng'],
      roomType: 'chung_cu_nguyen_can', roomCount: 2, price: 20000000, priceUnit: 'month', area: 80,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true, hasBalcony: true,
      electricityPrice: 'standard', amenities: ['Tủ lạnh', 'Máy giặt', 'Giường tủ'],
      images: ['https://images.unsplash.com/photo-1713359003488-53609bbd95c7?w=800&h=600&fit=crop'],
      postStatus: 'pending', displayDuration: 1, displayDurationUnit: 'month', postFee: 200000,
      views: 0, favorites: 0,
    },
    {
      ownerId: owner1._id, ownerName: owner1.name, ownerPhone: owner1.phone,
      title: 'Phòng trọ Cầu Giấy siêu đẹp, nội thất mới',
      description: 'Phòng khép kín sạch sẽ, gần các trường đại học (QGHN, Báo chí, Sư phạm). Có điều hòa, nóng lạnh, máy giặt chung.',
      address: { street: 'Ngõ 130 Xuân Thủy', ward: 'Dịch Vọng Hậu', district: 'Quận Cầu Giấy', city: 'Hà Nội', full: 'Ngõ 130 Xuân Thủy, Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội' },
      nearBy: ['ĐH Quốc Gia Hà Nội', 'ĐH Sư Phạm', 'Học viện Báo chí'],
      roomType: 'phong_tro', roomCount: 1, price: 3200000, priceUnit: 'month', area: 22,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'shared', hasAC: true,
      electricityPrice: 'rental', electricityRate: 3800, waterRate: 100000,
      amenities: ['Giường tủ', 'Máy giặt chung', 'Chỗ để xe free'],
      images: ['https://images.unsplash.com/photo-1765464184843-105e144bd54b?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 1, displayDurationUnit: 'month', postFee: 200000,
      views: 156, favorites: 12, approvedAt: new Date('2024-03-10'), expiresAt: new Date('2026-06-15'),
    },
    {
      ownerId: owner2._id, ownerName: owner2.name, ownerPhone: owner2.phone,
      title: 'Chung cư mini phố Tôn Thất Tùng, gần ĐH Y Hà Nội',
      description: 'Chung cư mini thang máy, thiết kế hiện đại, full đồ. Kế cận ĐH Y, Vincom Phạm Ngọc Thạch.',
      address: { street: '10 Tôn Thất Tùng', ward: 'Trung Tự', district: 'Quận Đống Đa', city: 'Hà Nội', full: '10 Tôn Thất Tùng, Trung Tự, Quận Đống Đa, Hà Nội' },
      nearBy: ['ĐH Y Hà Nội', 'Vincom Phạm Ngọc Thạch'],
      roomType: 'chung_cu_mini', roomCount: 1, price: 6500000, priceUnit: 'month', area: 35,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true, hasBalcony: true,
      electricityPrice: 'rental', electricityRate: 3500, waterRate: 120000,
      amenities: ['Tủ lạnh', 'Máy giặt riêng', 'Giường', 'Tủ quần áo'],
      images: ['https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 1, displayDurationUnit: 'quarter', postFee: 450000,
      views: 310, favorites: 45, approvedAt: new Date('2024-02-20'), expiresAt: new Date('2026-05-20'),
    },
    // ĐÀ NẴNG
    {
      ownerId: owner1._id, ownerName: owner1.name, ownerPhone: owner1.phone,
      title: 'Phòng trọ cao cấp gần ĐH Kinh Tế, Ngũ Hành Sơn',
      description: 'Phòng mới kính coong, full nội thất, giờ giấc tự do, không chung chủ. Gần các tiện ích thiết yếu và ĐH Kinh Tế.',
      address: { street: '120 Châu Thị Tế', ward: 'Bắc Mỹ Phú', district: 'Quận Ngũ Hành Sơn', city: 'Đà Nẵng', full: '120 Châu Thị Tế, Bắc Mỹ Phú, Quận Ngũ Hành Sơn, Đà Nẵng' },
      nearBy: ['ĐH Kinh Tế Đà Nẵng', 'Bãi biển Mỹ Khê'],
      roomType: 'phong_tro', roomCount: 1, price: 3000000, priceUnit: 'month', area: 25,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true,
      electricityPrice: 'rental', electricityRate: 3500, waterRate: 70000,
      amenities: ['Giường', 'Tủ áo', 'Tủ lạnh', 'Máy giặt chung', 'WIFI free'],
      images: ['https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 3, displayDurationUnit: 'month', postFee: 600000,
      status: 'available', views: 245, favorites: 30, approvedAt: new Date('2024-01-10'), expiresAt: new Date('2026-07-10'),
    },
    {
      ownerId: owner3._id, ownerName: owner3.name, ownerPhone: owner3.phone,
      title: 'Căn hộ view biển Mỹ Khê - Chung cư Mường Thanh',
      description: 'Căn hộ view trực diện biển, đón bình minh tuyệt đẹp. An ninh 24/7, hồ bơi, siêu thị ngay dưới chân nhà.',
      address: { street: 'Võ Nguyên Giáp', ward: 'Mỹ An', district: 'Quận Sơn Trà', city: 'Đà Nẵng', full: 'Võ Nguyên Giáp, Mỹ An, Quận Sơn Trà, Đà Nẵng' },
      nearBy: ['Bãi biển Mỹ Khê', 'Cầu Rồng'],
      roomType: 'chung_cu_nguyen_can', roomCount: 2, price: 12000000, priceUnit: 'month', area: 60,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true, hasBalcony: true,
      electricityPrice: 'standard',
      amenities: ['Full đồ điện tử', 'Sofa', 'Bếp hiện đại', 'Ban công view biển'],
      images: ['https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 6, displayDurationUnit: 'month', postFee: 1200000,
      status: 'available', views: 800, favorites: 150, approvedAt: new Date('2024-02-05'), expiresAt: new Date('2026-08-05'),
    },
    // CẦN THƠ
    {
      ownerId: owner2._id, ownerName: owner2.name, ownerPhone: owner2.phone,
      title: 'Phòng trọ giá sinh viên, 2 phút bộ đến ĐH Cần Thơ',
      description: 'Dãy trọ an ninh, có camera, bãi xe miễn phí, phòng có gác lửng, sạch sẽ thoáng mát.',
      address: { street: 'Hẻm 51 Đường 3/2', ward: 'Xuân Khánh', district: 'Quận Ninh Kiều', city: 'Cần Thơ', full: 'Hẻm 51 Đường 3/2, Xuân Khánh, Quận Ninh Kiều, Cần Thơ' },
      nearBy: ['ĐH Cần Thơ', 'TTTM Vincom Xuân Khánh'],
      roomType: 'phong_tro', roomCount: 1, price: 1500000, priceUnit: 'month', area: 18,
      bathroom: { type: 'private', hasHotWater: false }, kitchen: 'shared', hasAC: false,
      electricityPrice: 'rental', electricityRate: 4000, waterRate: 100000,
      amenities: ['Gác lửng', 'Giữ xe', 'Internet'],
      images: ['https://images.unsplash.com/photo-1765464184843-105e144bd54b?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 1, displayDurationUnit: 'month', postFee: 200000,
      status: 'available', views: 50, favorites: 2, approvedAt: new Date('2024-03-20'), expiresAt: new Date('2026-04-20'),
    },
    {
      ownerId: owner1._id, ownerName: owner1.name, ownerPhone: owner1.phone,
      title: 'Nhà nguyên căn 1 lầu 1 trệt, tiện kinh doanh Quận Cái Răng',
      description: 'Nhà mới xây khu dân cư yên tĩnh, mặt tiền đường lớn ô tô tới tận ngõ, thuận tiện kinh doanh hoặc làm văn phòng.',
      address: { street: 'Đường số 1', ward: 'Hưng Phú', district: 'Quận Cái Răng', city: 'Cần Thơ', full: 'Đường số 1, Hưng Phú, Quận Cái Răng, Cần Thơ' },
      nearBy: ['Siêu thị GO!', 'Bệnh viện Hoàn Mỹ'],
      roomType: 'nha_nguyen_can', roomCount: 2, price: 7000000, priceUnit: 'month', area: 100,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true, hasBalcony: true,
      electricityPrice: 'standard',
      amenities: ['Mặt tiền đường', 'Camera an ninh', 'Nhà để xe'],
      images: ['https://images.unsplash.com/photo-1770462573891-ef8559618921?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 3, displayDurationUnit: 'month', postFee: 600000,
      status: 'available', views: 120, favorites: 8, approvedAt: new Date('2024-01-25'), expiresAt: new Date('2026-04-25'),
    },
    // BÌNH DƯƠNG
    {
      ownerId: owner3._id, ownerName: owner3.name, ownerPhone: owner3.phone,
      title: 'Chung cư mini Bcons Suối Tiên, ngay cửa ngõ Làng Đại học',
      description: 'Căn hộ 2 mặt thoáng, tầng trung mát mẻ, đầy đủ nội thất cơ bản, chỉ xách vali vào ở. Rất tiện cho sinh viên làng ĐH',
      address: { street: 'Đường Tân Lập', ward: 'Đông Hòa', district: 'TP. Dĩ An', city: 'Bình Dương', full: 'Đường Tân Lập, Đông Hòa, TP. Dĩ An, Bình Dương' },
      nearBy: ['Làng Đại học Quốc Gia TP.HCM', 'Metro Suối Tiên', 'Bến xe Miền Đông mới'],
      roomType: 'chung_cu_mini', roomCount: 2, price: 5000000, priceUnit: 'month', area: 55,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true, hasBalcony: true,
      electricityPrice: 'rental', electricityRate: 3500, waterRate: 150000,
      amenities: ['Tủ lạnh', 'Máy giặt', 'Giường', 'Tủ quần áo'],
      images: ['https://images.unsplash.com/photo-1713359003488-53609bbd95c7?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 1, displayDurationUnit: 'quarter', postFee: 450000,
      status: 'available', views: 430, favorites: 55, approvedAt: new Date('2024-03-01'), expiresAt: new Date('2026-06-01'),
    },
    {
      ownerId: owner2._id, ownerName: owner2.name, ownerPhone: owner2.phone,
      title: 'Phòng trọ Thủ Dầu Một sau lưng Đại Học Bình Dương',
      description: 'Phòng mới sạch sẽ, yên tĩnh, phù hợp sinh viên và người đi làm. Không tính phí để xe.',
      address: { street: 'Đường Hoàng Hoa Thám', ward: 'Hiệp Thành', district: 'TP. Thủ Dầu Một', city: 'Bình Dương', full: 'Đường Hoàng Hoa Thám, Hiệp Thành, TP. Thủ Dầu Một, Bình Dương' },
      nearBy: ['ĐH Bình Dương', 'Chợ Thủ Dầu Một'],
      roomType: 'phong_tro', roomCount: 1, price: 2000000, priceUnit: 'month', area: 25,
      bathroom: { type: 'private', hasHotWater: true }, kitchen: 'private', hasAC: true,
      electricityPrice: 'rental', electricityRate: 4000, waterRate: 80000,
      amenities: ['Giường', 'Tủ áo', 'Điều hòa'],
      images: ['https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop'],
      postStatus: 'approved', displayDuration: 1, displayDurationUnit: 'month', postFee: 200000,
      status: 'available', views: 80, favorites: 5, approvedAt: new Date('2024-03-15'), expiresAt: new Date('2026-04-15'),
    }
  ]);

  console.log(`🏠 Created ${rooms.length} rooms`);

  // ── REVIEWS ────────────────────────────────────────
  await Review.create([
    { roomId: rooms[0]._id, userId: renter1._id, userName: renter1.name, userAvatar: renter1.avatar, rating: 5, comment: 'Phòng rất sạch sẽ, chủ nhà thân thiện. Rất hài lòng!', status: 'approved' },
    { roomId: rooms[0]._id, userId: renter2._id, userName: renter2.name, userAvatar: renter2.avatar, rating: 4, comment: 'Phòng đẹp, giá hợp lý. Hơi ồn một chút vào buổi tối.', status: 'approved' },
    { roomId: rooms[1]._id, userId: renter1._id, userName: renter1.name, userAvatar: renter1.avatar, rating: 5, comment: 'Căn hộ rất cao cấp, vị trí thuận tiện. Xứng đáng 5 sao!', status: 'approved' },
  ]);
  console.log('⭐ Created 3 reviews');

  // ── NOTIFICATIONS ──────────────────────────────────
  await Notification.create([
    { userId: owner1._id, title: 'Bài đăng được duyệt', message: 'Bài đăng "Phòng trọ đầy đủ nội thất" đã được phê duyệt.', type: 'approval' },
    { userId: admin._id, title: 'Bài đăng mới chờ duyệt', message: 'Chủ nhà Lê Thị Hương vừa đăng bài "Chung cư nguyên căn 2PN". Đang chờ phê duyệt.', type: 'system' },
  ]);
  console.log('🔔 Created 2 notifications');

  // ── CHAT ────────────────────────────────────────────
  await ChatMessage.create([
    { fromId: owner1._id, fromName: owner1.name, toId: admin._id, message: 'Xin chào Admin, tôi muốn hỏi về quy trình gia hạn bài đăng?' },
    { fromId: admin._id, fromName: admin.name, toId: owner1._id, message: 'Chào anh Minh! Vào mục quản lý bài đăng, chọn bài muốn gia hạn và nhấn "Gia hạn".' },
  ]);
  console.log('💬 Created 2 chat messages');

  // ── REPORTS ────────────────────────────────────────
  await Report.create([
    { roomId: rooms[2]._id, userId: renter1._id, reason: 'Thông tin không chính xác', description: 'Diện tích thực tế nhỏ hơn so với mô tả.', status: 'pending' },
  ]);
  console.log('🚩 Created 1 report');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo accounts:');
  console.log('  Admin:    admin@7tro.vn  /  admin123');
  console.log('  Owner:    owner@test.vn         /  owner123');
  console.log('  Renter:   renter@test.vn        /  renter123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
