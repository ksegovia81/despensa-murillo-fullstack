require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { initializeAdminUser, initializeProducts, initializeDiscounts } = require('./seed/init');

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');
    await Promise.all([
      initializeProducts(),
      initializeAdminUser(),
      initializeDiscounts()
    ]);
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error MongoDB:', err.message);
    process.exit(1);
  });
