const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    publisher: { type: String, required: true, trim: true, maxlength: 120 },
    publishYear: { type: Number, required: true, min: 0, max: 9999 },
    isbn: { type: String, required: true, trim: true, unique: true, maxlength: 32 },
    quantity: { type: Number, required: true, min: 0, validate: Number.isInteger },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Book', bookSchema);
