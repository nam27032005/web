const User = require('./User');
const Room = require('./Room');
const Review = require('./Review');
const ChatMessage = require('./ChatMessage');
const Notification = require('./Notification');
const Report = require('./Report');
const Otp = require('./Otp');

// User <-> Room
User.hasMany(Room, { foreignKey: 'ownerId', as: 'rooms', onDelete: 'CASCADE' });
Room.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Room <-> Review
Room.hasMany(Review, { foreignKey: 'roomId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> ChatMessage (sender)
User.hasMany(ChatMessage, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User <-> ChatMessage (receiver)
User.hasMany(ChatMessage, { foreignKey: 'receiverId', as: 'receivedMessages', onDelete: 'CASCADE' });
ChatMessage.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Report (reporter)
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports', onDelete: 'CASCADE' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

// Room <-> Report
Room.hasMany(Report, { foreignKey: 'roomId', as: 'reports', onDelete: 'CASCADE' });
Report.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

module.exports = { User, Room, Review, ChatMessage, Notification, Report, Otp };
