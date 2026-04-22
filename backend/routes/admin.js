const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Discount = require('../models/Discount');

// ── Products ───────────────────────────────────────────────────────────────

router.get('/products', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, price, image, description, stock } = req.body;
    if (!name || !category || price === undefined || !description || stock === undefined) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const product = new Product({ name, category, price, image: image || '📦', description, stock });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Soft delete — sets isActive: false instead of removing the document
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Orders ─────────────────────────────────────────────────────────────────

router.get('/orders', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allowed = ['confirmado', 'preparando', 'enviado', 'entregado'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Stats ──────────────────────────────────────────────────────────────────

router.get('/stats', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const [totalProducts, lowStockProducts, totalOrders, salesAgg] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, stock: { $lte: 5 } }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }])
    ]);
    res.json({
      totalProducts,
      lowStockProducts,
      totalOrders,
      totalSales: salesAgg[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Discounts ──────────────────────────────────────────────────────────────

router.get('/discounts', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/discounts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { day, discount, category, text } = req.body;
    if (!day || !discount || !category || !text) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    if (await Discount.findOne({ day })) {
      return res.status(400).json({ message: 'Ya existe un descuento para este día' });
    }
    const newDiscount = new Discount({ day, discount: parseInt(discount), category, text, isActive: true });
    await newDiscount.save();
    res.status(201).json(newDiscount);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

router.put('/discounts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!discount) return res.status(404).json({ message: 'Descuento no encontrado' });
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/discounts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Descuento no encontrado' });
    res.json({ message: 'Descuento eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
