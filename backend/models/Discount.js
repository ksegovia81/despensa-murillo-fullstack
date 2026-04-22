const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    unique: true,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  },
  discount: { type: Number, required: true, min: 1, max: 100 },
  category: { type: String, required: true, enum: ['almacen', 'comida', 'all', 'delivery'] },
  text: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Discount', DiscountSchema);
