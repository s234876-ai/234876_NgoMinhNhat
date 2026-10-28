const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/Book');

const app = express();
function normalizeOrigin(value) {
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).origin;
  } catch {
    return '';
  }
}

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS'));
  },
}));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/books', async (req, res, next) => {
  try {
    const filter = {};
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchPattern = new RegExp(escapedSearch, 'i');
      filter.$or = ['title', 'author', 'category', 'publisher', 'isbn'].map((field) => ({
        [field]: searchPattern,
      }));
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    return res.json(books);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/books/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Mã sách không hợp lệ.' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách.' });
    return res.json(book);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/books', async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    return res.status(201).json(book);
  } catch (error) {
    return next(error);
  }
});

app.put('/api/books/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Mã sách không hợp lệ.' });
    }
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: 'query',
    });
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách.' });
    return res.json(book);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/books/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Mã sách không hợp lệ.' });
    }
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách.' });
    return res.json({ message: 'Đã xóa sách.', id: book.id });
  } catch (error) {
    return next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy đường dẫn ${req.path}.` });
});

app.use((error, _req, res, _next) => {
  if (error.code === 11000) {
    return res.status(409).json({ message: 'ISBN này đã tồn tại.' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError'
    || (error instanceof SyntaxError && 'body' in error)) {
    return res.status(400).json({ message: error.message });
  }
  if (error.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ.' });
});

module.exports = app;
