const { Room, User } = require('./models');
const { connectDB, sequelize } = require('./config/db');

async function test() {
  await connectDB();
  try {
    const rooms = await Room.findAll({
      where: { ownerId: 2 }, // sample ownerId
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'gender'],
        },
      ],
      logging: console.log
    });
    console.log('Success! Found', rooms.length, 'rooms');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await sequelize.close();
  }
}

test();
