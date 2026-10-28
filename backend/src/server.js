require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Thiếu MONGODB_URI. Hãy cấu hình biến môi trường trước khi chạy API.');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  dbName: process.env.MONGODB_DB || '234876_NgoMinhNhat',
})
  .then(() => {
    console.log('Đã kết nối MongoDB database 234876_NgoMinhNhat.');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Books API đang chạy tại cổng ${port}.`);
    });
  })
  .catch((error) => {
    console.error('Không thể kết nối MongoDB:', error.message);
    process.exit(1);
  });
