require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

const sampleBooks = [
  {
    title: 'Nhà giả kim',
    author: 'Paulo Coelho',
    category: 'Tiểu thuyết',
    publisher: 'NXB Văn học',
    publishYear: 2020,
    isbn: '9786043074546',
    quantity: 5,
    description: 'Hành trình theo đuổi ước mơ và lắng nghe trái tim mình.',
  },
  {
    title: 'Dế Mèn phiêu lưu ký',
    author: 'Tô Hoài',
    category: 'Văn học thiếu nhi',
    publisher: 'NXB Kim Đồng',
    publishYear: 2022,
    isbn: '9786042261580',
    quantity: 8,
    description: 'Tác phẩm kinh điển về những chuyến phiêu lưu của Dế Mèn.',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Công nghệ',
    publisher: 'Prentice Hall',
    publishYear: 2008,
    isbn: '9780132350884',
    quantity: 3,
    description: 'Nguyên tắc viết mã nguồn dễ đọc, dễ bảo trì.',
  },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Thiếu MONGODB_URI. Hãy cấu hình Atlas hoặc MongoDB local trước khi seed.');
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || '234876_NgoMinhNhat',
  });

  for (const book of sampleBooks) {
    await Book.updateOne({ isbn: book.isbn }, { $setOnInsert: book }, { upsert: true });
  }

  console.log(`Đã bảo đảm có ${sampleBooks.length} sách mẫu trong database 234876_NgoMinhNhat.`);
}

seed()
  .catch((error) => {
    console.error('Không thể thêm dữ liệu mẫu:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
