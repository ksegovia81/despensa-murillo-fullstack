const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, total, paymentMethod, deliveryOption } = req.body;

    if (!items || !items.length || !total || !paymentMethod || !deliveryOption) {
      return res.status(400).json({ message: 'Datos del pedido incompletos' });
    }

    // Validate stock before decrementing
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Producto no disponible: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para: ${item.name}` });
      }
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    const order = new Order({ items, total, paymentMethod, deliveryOption, user: req.user.id });
    await order.save();
    await order.populate('user', 'name email');

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
