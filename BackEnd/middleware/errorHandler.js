/** Error handler middleware – luôn đặt cuối cùng trong Express */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ.';

  // Sequelize: duplicate entry (unique constraint)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const field = err.errors?.[0]?.path || 'field';
    message = `${field} đã tồn tại trong hệ thống.`;
  }

  // Sequelize: validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  // Sequelize: foreign key / database error
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'Lỗi truy vấn cơ sở dữ liệu.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token đã hết hạn.';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
