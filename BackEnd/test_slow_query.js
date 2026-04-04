const { Room, User } = require('./models');
const { connectDB, sequelize } = require('./config/db');

async function test() {
  await connectDB();
  try {
    const ownerId = 2;
    console.log('Testing getMyRooms exact query...');
    const rooms = await Room.findAll({
      where: { ownerId },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'gender'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    console.log('Success! Found', rooms.length, 'rooms');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await sequelize.close();
  }
}

test();
