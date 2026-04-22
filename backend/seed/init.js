const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Discount = require('../models/Discount');

const initializeAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@despensamurillo.com';
    if (await User.findOne({ email: adminEmail })) return;

    const adminUser = new User({
      email: adminEmail,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12),
      name: process.env.ADMIN_NAME || 'Administrador',
      isAdmin: true
    });
    await adminUser.save();
    console.log('✅ Usuario administrador creado:', adminEmail);
  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
  }
};

const initializeProducts = async () => {
  try {
    if (await Product.countDocuments()) return;
    await Product.insertMany([
      { name: 'Arroz Doña María 1kg', category: 'almacen', price: 8500, image: '🌾', description: 'Arroz de primera calidad', stock: 100 },
      { name: 'Pollo al Spiedo', category: 'comida', price: 45000, image: '🍗', description: 'Pollo entero al spiedo con especias', stock: 20 },
      { name: 'Aceite Cocinero 900ml', category: 'almacen', price: 12000, image: '🫒', description: 'Aceite vegetal para cocinar', stock: 50 }
    ]);
    console.log('✅ Productos de ejemplo creados');
  } catch (error) {
    console.error('❌ Error inicializando productos:', error.message);
  }
};

const initializeDiscounts = async () => {
  try {
    if (await Discount.countDocuments()) return;
    await Discount.insertMany([
      { day: 'Lunes',     discount: 10, category: 'almacen',  text: '10% OFF en productos de almacén' },
      { day: 'Martes',    discount: 15, category: 'comida',   text: '15% OFF en comidas preparadas' },
      { day: 'Miércoles', discount: 20, category: 'all',      text: '20% OFF en toda la tienda' },
      { day: 'Jueves',    discount: 10, category: 'almacen',  text: '10% OFF en productos de almacén' },
      { day: 'Viernes',   discount: 15, category: 'comida',   text: '15% OFF en comidas preparadas' },
      { day: 'Sábado',    discount: 25, category: 'delivery', text: '25% OFF en delivery' },
      { day: 'Domingo',   discount: 12, category: 'all',      text: '12% OFF en toda la tienda' }
    ]);
    console.log('✅ Descuentos por defecto creados');
  } catch (error) {
    console.error('❌ Error inicializando descuentos:', error.message);
  }
};

module.exports = { initializeAdminUser, initializeProducts, initializeDiscounts };
