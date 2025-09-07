// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware CORS para desarrollo (más permisivo)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
// Agrega esto después del middleware CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.use(express.json());
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Error MongoDB:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '📦' }, // ← CAMBIA required por default
  description: { type: String, required: true },
  stock: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

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
  status: { type: String, enum: ['confirmado', 'preparando', 'enviado', 'entregado'], default: 'confirmado' },
  paymentMethod: { type: String, required: true },
  deliveryOption: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// NUEVO ESQUEMA PARA DESCUENTOS
const DiscountSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    unique: true // ← Esto asegura que solo haya un descuento por día
  },
  discount: { 
    type: Number, 
    required: true,
    min: 1,
    max: 100
  },
  category: { 
    type: String, 
    required: true,
    enum: ['almacen', 'comida', 'all', 'delivery']
  },
  text: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ELIMINA cualquier campo "code" si existe en el esquema

// Models
const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Discount = mongoose.model('Discount', DiscountSchema); // NUEVO MODELO

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Función para crear usuario administrador automáticamente
const initializeAdminUser = async () => {
  try {
    const adminEmail = 'admin@despensamurillo.com';
    const adminPassword = 'admin123';
    
    // Verificar si ya existe el admin
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Crear usuario administrador
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador',
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('✅ Usuario administrador creado:', adminEmail);
      console.log('🔑 Contraseña: admin123');
    } else {
      console.log('⚠️  Usuario administrador ya existe:', adminEmail);
    }
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
  }
}

// Inicializar descuentos por defecto
const initializeDiscounts = async () => {
  try {
    const count = await Discount.countDocuments();
    if (count === 0) {
      const defaultDiscounts = [
        { day: 'Lunes', discount: 10, category: 'almacen', text: '10% OFF en productos de almacén' },
        { day: 'Martes', discount: 15, category: 'comida', text: '15% OFF en comidas preparadas' },
        { day: 'Miércoles', discount: 20, category: 'all', text: '20% OFF en toda la tienda' },
        { day: 'Jueves', discount: 10, category: 'almacen', text: '10% OFF en productos de almacén' },
        { day: 'Viernes', discount: 15, category: 'comida', text: '15% OFF en comidas preparadas' },
        { day: 'Sábado', discount: 25, category: 'delivery', text: '25% OFF en delivery' },
        { day: 'Domingo', discount: 12, category: 'all', text: '12% OFF en toda la tienda' }
      ];
      
      await Discount.insertMany(defaultDiscounts);
      console.log('✅ Descuentos por defecto creados');
    }
  } catch (error) {
    console.error('❌ Error inicializando descuentos:', error);
  }
};

// server.js - Rutas de autenticación (asegúrate de que estén así)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Intento de login con email:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    console.log('✅ Login exitoso:', email);

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// NO OLVIDES la ruta de registro también
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// PRODUCT ROUTES
app.get('/api/products', async (_req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.get('/api/admin/products', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.post('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📦 Datos recibidos para nuevo producto:', req.body);
    
    // Validar campos requeridos
    const { name, category, price, image, description, stock } = req.body;
    
    if (!name || !category || !price || !image || !description || !stock) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: name, category, price, image, description, stock' 
      });
    }

    const product = new Product(req.body);
    await product.save();
    
    console.log('✅ Producto creado exitosamente:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// ORDER ROUTES
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user.id
    });
    
    // Reducir stock de productos
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }
    
    await order.save();
    await order.populate('user', 'name email');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.put('/api/admin/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// STATS ROUTES (para admin dashboard)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ isActive: true, stock: { $lte: 5 } });
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      totalOrders,
      totalSales: totalSales[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// NUEVAS RUTAS PARA DESCUENTOS
// NUEVAS RUTAS PARA DESCUENTOS - VERIFICA QUE ESTÉN EN TU server.js
app.get('/api/discounts', async (_req, res) => {
  try {
    const discounts = await Discount.find({ isActive: true });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.get('/api/discounts/today', async (_req, res) => {
  try {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
    
    const discount = await Discount.findOne({ 
      day: todayCapitalized, 
      isActive: true 
    });
    
    res.json(discount || null);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.get('/api/admin/discounts', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const discounts = await Discount.find().sort({ day: 1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.post('/api/admin/discounts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📝 Recibiendo solicitud para nuevo descuento:', req.body);
    
    const { day, discount, category, text } = req.body;
    
    if (!day || !discount || !category || !text) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: day, discount, category, text' 
      });
    }

    // Verificar si ya existe un descuento para este día
    const existingDiscount = await Discount.findOne({ day });
    if (existingDiscount) {
      return res.status(400).json({ 
        message: 'Ya existe un descuento para este día' 
      });
    }

    const newDiscount = new Discount({
      day,
      discount: parseInt(discount),
      category,
      text,
      isActive: true
    });
    
    await newDiscount.save();
    
    console.log('✅ Descuento creado:', newDiscount);
    res.status(201).json(newDiscount);
    
  } catch (error) {
    console.error('❌ Error creando descuento:', error);
    res.status(500).json({ 
      message: 'Error del servidor',
      error: error.message 
    });
  }
});

app.put('/api/admin/discounts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!discount) {
      return res.status(404).json({ message: 'Descuento no encontrado' });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.delete('/api/admin/discounts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Descuento no encontrado' });
    }
    res.json({ message: 'Descuento eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Inicializar productos de ejemplo
const initializeProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const sampleProducts = [
        {
          name: 'Arroz Doña María 1kg',
          category: 'almacen',
          price: 8500,
          image: '🌾',
          description: 'Arroz de primera calidad',
          stock: 100
        },
        {
          name: 'Pollo al Spiedo',
          category: 'comida',
          price: 45000,
          image: '🍗',
          description: 'Pollo entero al spiedo con especias',
          stock: 20
        },
        {
          name: 'Aceite Cocinero 900ml',
          category: 'almacen',
          price: 12000,
          image: '🫒',
          description: 'Aceite vegetal para cocinar',
          stock: 50
        }
      ];
      
      await Product.insertMany(sampleProducts);
      console.log('✅ Productos de ejemplo creados');
    }
  } catch (error) {
    console.error('❌ Error inicializando productos:', error);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  
  // Inicializar productos, usuario admin y descuentos
  await initializeProducts();
  await initializeAdminUser();
  await initializeDiscounts(); // 👈 NUEVA INICIALIZACIÓN
});