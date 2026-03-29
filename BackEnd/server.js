require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const reportRoutes = require('./routes/reports');

// ── App setup ────────────────────────────────────────
const app = express();

// Kết nối MongoDB
connectDB();

// ── Middleware ───────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check & Root ──────────────────────────────
app.get('/', (_req, res) =>
  res.json({ success: true, message: 'Chào mừng đến với hệ thống API của EasyAccomod!' })
);

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'EasyAccomod API is running 🚀', env: process.env.NODE_ENV })
);

// ── API Routes ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);

// ── Swagger UI Docs ──────────────────────────────────
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger-output.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
} catch (err) {
  console.log('⚠️ Bỏ qua Swagger Docs do chưa có swagger-output.json. Hãy chạy "npm run swagger" trước.');
}

// ── 404 handler ──────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại.` })
);

// ── Global error handler ─────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

// CHỈ start server khi file được chạy trực tiếp (VD: node server.js hoặc nodemon server.js)
// Không start khi bị require bởi file khác (VD: swagger.js hoặc các file test)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 EasyAccomod API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;