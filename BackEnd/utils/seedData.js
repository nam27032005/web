/**
 * Hệ thống Tạo Dữ liệu mẫu (Seed) lớn cho EasyAccomod
 * Chạy: node utils/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Room = require('../models/Room');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const ChatMessage = require('../models/ChatMessage');
const Report = require('../models/Report');

// --- CẤU HÌNH SỐ LƯỢNG ---
const COUNT_OWNERS = 15;
const COUNT_RENTERS = 35;
const COUNT_ROOMS_PER_OWNER = 12; // Tổng khoảng 180 phòng
const COUNT_REVIEWS_TOTAL = 400;

// --- DỮ LIỆU GỐC (POOLS) ---
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const middleNames = ['Văn', 'Thị', 'Minh', 'Thành', 'Hữu', 'Anh', 'Quốc', 'Ngọc', 'Phương', 'Đức'];
const lastNames = ['Hùng', 'Lan', 'Nam', 'Hoa', 'Tuấn', 'Hương', 'Dũng', 'Mai', 'Thắng', 'Cường', 'Trang', 'Tú', 'Yến', 'Long', 'Vinh'];

const cities = [
  { name: 'Hà Nội', districts: ['Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Hoàn Kiếm'], wards: ['Dịch Vọng', 'Láng Hạ', 'Bách Khoa', 'Khương Trung', 'Hàng Đào'] },
  { name: 'TP. Hồ Chí Minh', districts: ['Quận 1', 'Quận 3', 'Quận 7', 'Quận Bình Thạnh', 'Quận Thủ Đức'], wards: ['Bến Nghé', 'Đa Kao', 'Tân Phong', 'Phường 25', 'Linh Trung'] },
  { name: 'Đà Nẵng', districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn'], wards: ['Thạch Thang', 'An Khê', 'Phước Mỹ', 'Bắc Mỹ Phú'] },
  { name: 'Cần Thơ', districts: ['Ninh Kiều', 'Cái Răng', 'Bình Thủy'], wards: ['Xuân Khánh', 'Hưng Phú', 'An Thới'] },
];

const titles = [
  'Phòng trọ giá rẻ sinh viên', 'Chung cư mini cao cấp full đồ', 'Nhà nguyên căn mặt tiền đẹp', 'Căn hộ dịch vụ an ninh 24/7',
  'Phòng mới xây thoáng mát', 'Trọ gần trường đại học', 'Studio hiện đại trung tâm', 'Phòng trọ ban công view đẹp',
  'Giá tốt - Không chung chủ', 'Phòng đầy đủ nội thất chỉ xách vali vào ở'
];

const descriptions = [
  'Vị trí cực đẹp, gần trạm xe buýt và các cửa hàng tiện lợi. Phòng sạch sẽ, có bảo vệ và camera an ninh.',
  'Nội thất mới 100% gồm điều hòa, nóng lạnh, giường tủ. Giờ giấc tự do, không chung chủ, khu dân trí cao.',
  'Thích hợp cho sinh viên hoặc người đi làm. Chỗ để xe rộng rãi, wifi tốc độ cao miễn phí.',
  'Phòng rộng, cửa sổ lớn đón ánh sáng tự nhiên. Ưu tiên khách ở lâu dài và giữ gìn vệ sinh.',
];

const amenities = ['Điều hòa', 'Bình nóng lạnh', 'Máy giặt', 'Tủ lạnh', 'Giường', 'Tủ quần áo', 'Wifi', 'Camera an ninh', 'Chỗ để xe'];
const roomTypes = ['phong_tro', 'chung_cu_mini', 'nha_nguyen_can', 'chung_cu_nguyen_can'];

// --- HELPER FUNCTIONS ---
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany(), Room.deleteMany(), Review.deleteMany(),
      Notification.deleteMany(), ChatMessage.deleteMany(), Report.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // 1. Tạo ADMIN
    await User.create({
      role: 'admin', name: 'Nguyễn Admin', email: 'admin@7tro.vn', password: 'admin123', phone: '0901234567', verified: true
    });

    // 2. Tạo OWNERS
    const ownersData = [];
    for (let i = 0; i < COUNT_OWNERS; i++) {
      ownersData.push({
        role: 'owner',
        name: `${getRandom(firstNames)} ${getRandom(middleNames)} ${getRandom(lastNames)}`,
        email: `owner${i + 1}@test.vn`,
        password: 'owner123',
        phone: `09${getRandomRange(10000000, 99999999)}`,
        verified: Math.random() > 0.2, // 80% đã xác minh
        address: `${getRandomRange(1, 400)} Lê Lợi, TP.HCM`,
        cccd: `01234567${getRandomRange(1000, 9999)}`,
        avatar: `https://i.pravatar.cc/150?u=owner${i}`
      });
    }
    const owners = await User.create(ownersData);
    console.log(`👤 Created ${owners.length} owners`);

    // 3. Tạo RENTERS
    const rentersData = [];
    for (let i = 0; i < COUNT_RENTERS; i++) {
      rentersData.push({
        role: 'renter',
        name: `${getRandom(firstNames)} ${getRandom(middleNames)} ${getRandom(lastNames)}`,
        email: `renter${i + 1}@test.vn`,
        password: 'renter123',
        phone: `08${getRandomRange(10000000, 99999999)}`,
        avatar: `https://i.pravatar.cc/150?u=renter${i}`
      });
    }
    const renters = await User.create(rentersData);
    console.log(`👤 Created ${renters.length} renters`);

    // 4. Tạo ROOMS
    const rooms = [];
    for (const owner of owners) {
      for (let j = 0; j < COUNT_ROOMS_PER_OWNER; j++) {
        const cityObj = getRandom(cities);
        const district = getRandom(cityObj.districts);
        const ward = getRandom(cityObj.wards);
        const street = `${getRandomRange(10, 500)} ${getRandom(['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Cách Mạng Tháng 8', 'Phạm Ngũ Lão'])}`;
        
        rooms.push({
          ownerId: owner._id,
          ownerName: owner.name,
          ownerPhone: owner.phone,
          title: `${getRandom(titles)} - ${district}, ${cityObj.name}`,
          description: getRandom(descriptions),
          address: {
            street, ward, district, city: cityObj.name,
            full: `${street}, ${ward}, ${district}, ${cityObj.name}`
          },
          roomType: getRandom(roomTypes),
          roomCount: getRandomRange(1, 3),
          price: getRandomRange(15, 150) * 100000, // 1.5M -> 15M
          area: getRandomRange(15, 80),
          bathroom: { type: Math.random() > 0.3 ? 'private' : 'shared', hasHotWater: true },
          kitchen: Math.random() > 0.5 ? 'private' : 'shared',
          hasAC: Math.random() > 0.4,
          postStatus: Math.random() > 0.1 ? 'approved' : 'pending',
          status: Math.random() > 0.2 ? 'available' : 'rented',
          views: getRandomRange(10, 2000),
          favorites: getRandomRange(0, 100),
          images: [`https://picsum.photos/seed/${Math.random()}/800/600`],
          amenities: Array.from({ length: 4 }, () => getRandom(amenities)),
          approvedAt: getRandomDate(new Date(2024, 0, 1), new Date()),
          expiresAt: getRandomDate(new Date(), new Date(2027, 0, 1)),
        });
      }
    }
    const createdRooms = await Room.insertMany(rooms);
    console.log(`🏠 Created ${createdRooms.length} rooms`);

    // 5. Tạo REVIEWS
    const reviews = [];
    for (let i = 0; i < COUNT_REVIEWS_TOTAL; i++) {
        const room = getRandom(createdRooms);
        const renter = getRandom(renters);
        reviews.push({
            roomId: room._id,
            userId: renter._id,
            userName: renter.name,
            userAvatar: renter.avatar,
            rating: getRandomRange(3, 5),
            comment: getRandom(['Phòng tốt!', 'Sạch sẽ, thoáng mát.', 'Chủ nhà rất nhiệt tình.', 'Vị trí thuận tiện.', 'Giá hơi cao nhưng chất lượng tốt.', 'An ninh rất đảm bảo.']),
            status: 'approved'
        });
    }
    await Review.insertMany(reviews);
    console.log(`⭐ Created ${reviews.length} reviews`);

    console.log('\n🎉 MEGA SEED completed successfully!');
    console.log('--- Account Summary ---');
    console.log(`Admin: admin@7tro.vn / admin123`);
    console.log(`Renter Example: renter1@test.vn / renter123`);
    console.log(`Owner Example: owner1@test.vn / owner123`);
    
    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ SEED FAILED:', err);
    process.exit(1);
  }
};

generateSeed();
