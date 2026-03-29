const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'EasyAccomod API',
    description: 'Tài liệu API cho ứng dụng quản lý nhà trọ EasyAccomod (Tự động tạo)',
    version: '1.0.0'
  },
  host: 'localhost:5000',
  basePath: '/',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Format: "Bearer {token}"'
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const outputFile = './swagger-output.json';
// Quét từ server.js để tìm tất cả các routes được sử dụng trong hệ thống
const routes = ['./server.js'];

// Tự động sinh swagger-output.json
swaggerAutogen(outputFile, routes, doc).then(() => {
  console.log('✅ Đã tạo/Cập nhật file swagger-output.json!');
});
