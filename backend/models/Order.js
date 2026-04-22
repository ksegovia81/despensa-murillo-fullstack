const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmado', 'preparando', 'enviado', 'entregado'],
    default: 'confirmado'
  },
  paymentMethod: { type: String, required: true, enum: ['bancard', 'ueno', 'cash'] },
  deliveryOption: { type: String, required: true, enum: ['delivery', 'pickup'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
