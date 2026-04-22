const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

router.get('/', async (_req, res) => {
  try {
    const discounts = await Discount.find({ isActive: true });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/today', async (_req, res) => {
  try {
    const todayName = DAYS[new Date().getDay()];
    const discount = await Discount.findOne({ day: todayName, isActive: true });
    res.json(discount || null);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
