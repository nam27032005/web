/** Error handler middleware – luôn đặt cuối cùng trong Express */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ.';

  // Mongoose: duplicate key (email trùng)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} đã tồn tại trong hệ thống.`;
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Không tìm thấy tài nguyên.';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
