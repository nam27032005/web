const { User } = require('./models');
const { connectDB, sequelize } = require('./config/db');

async function findOwner() {
  await connectDB();
  const user = await User.findOne({ where: { email: 'owner1@gmail.com' } });
  if (user) {
    console.log('Owner ID:', user.id);
  } else {
    console.log('Owner not found');
  }
  await sequelize.close();
}

findOwner();
