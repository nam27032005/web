const { Room, User } = require('./models');
const { connectDB, sequelize } = require('./config/db');

async function test() {
  await connectDB();
  try {
    const ownerId = "2"; // Use string!
    console.log('Testing with ownerId as string:', ownerId);
    const rooms = await Room.findAll({
      where: { ownerId: ownerId }, 
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'gender'],
        },
      ],
    });
    console.log('Success! Found', rooms.length, 'rooms');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await sequelize.close();
  }
}

test();
