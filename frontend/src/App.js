import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, User, Home, Utensils, Package, Clock, Truck, CreditCard, Percent, Settings, Plus, Edit, Trash2, Eye, DollarSign } from 'lucide-react';

// API Service
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${url}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la solicitud');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Componente AdminOrdersView
const AdminOrdersView = ({ setAdminView }) => {
  const [adminOrders, setAdminOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminOrders = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/admin/orders');
        setAdminOrders(data);
      } catch (error) {
        console.error('Error cargando pedidos admin:', error);
        alert('Error al cargar pedidos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadAdminOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiRequest(`/admin/orders/${orderId}`, {
        method: 'PUT',
        body: { status }
      });
      
      // Update local state
      setAdminOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      alert('Error actualizando estado: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-20 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestionar Pedidos ({adminOrders.length})</h2>
        <button
          onClick={() => setAdminView('overview')}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
        >
          ← Volver
        </button>
      </div>

      <div className="space-y-4">
        {adminOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-6">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No hay pedidos aún</p>
          </div>
        ) : (
          adminOrders.map(order => (
            <div key={order._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Pedido #{order._id.slice(-6)}</h3>
                  <p className="text-gray-600 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-sm mt-1">Cliente: {order.user?.email || 'Usuario eliminado'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="preparando">Preparando</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                {order.items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                    <span className="font-medium">₲{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span className="text-gray-800">Total:</span>
                <span className="text-green-600">₲{order.total.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Componente AdminProductsView
const AdminProductsView = ({ 
  setAdminView, 
  loadAdminProducts, 
  newProduct, 
  setNewProduct, 
  resetNewProduct, 
  handleAddProduct, 
  editingProduct, 
  setEditingProduct, 
  handleUpdateProduct, 
  toggleProductActive, 
  deleteProduct, 
  products 
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadAdminProducts();
      setLoading(false);
    };
    loadData();
  }, [loadAdminProducts]);

  if (loading) {
    return (
      <div className="p-4 pb-20 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestionar Productos</h2>
        <button
          onClick={() => setAdminView('overview')}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
        >
          ← Volver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Plus className="h-5 w-5 mr-2 text-blue-500" />
          Agregar Nuevo Producto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
            <input
              type="text"
              placeholder="Ej: Arroz"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            >
              <option value="almacen">Almacén</option>
              <option value="comida">Comida</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              placeholder="Ej: 10000"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              placeholder="Ej: 50"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji/Imagen</label>
            <input
              type="text"
              placeholder="Ej: 🍗"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              placeholder="Describe el producto..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              rows="3"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={resetNewProduct}
            className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-lg"
          >
            Limpiar
          </button>
          <button
            onClick={handleAddProduct}
            className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
          >
            Agregar Producto
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="font-bold text-xl text-gray-800">Productos Existentes ({products.length})</h3>
        
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-6">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No hay productos aún</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product._id} className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 ${!product.isActive ? 'opacity-60' : ''}`}>
              {editingProduct && editingProduct._id === product._id ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      >
                        <option value="almacen">Almacén</option>
                        <option value="comida">Comida</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                      <input
                        type="number"
                        placeholder="Precio"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        placeholder="Stock"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                      <input
                        type="text"
                        placeholder="Emoji"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        placeholder="Descripción"
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        rows="3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdateProduct(product._id)}
                      className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <span className="text-5xl">{product.image}</span>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{product.name}</h4>
                      <p className="text-gray-600 text-base mt-1">{product.description}</p>
                      <p className="text-base mt-2">
                        <span className="font-semibold text-green-600">₲{product.price.toLocaleString()}</span> | 
                        <span className={`ml-2 ${product.stock <= 5 ? 'text-orange-500 font-medium' : 'text-green-500'}`}>
                          Stock: {product.stock}
                        </span> | 
                        <span className="ml-2 capitalize bg-gray-100 px-2 py-1 rounded text-sm">{product.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleProductActive(product._id)}
                      className={`p-3 rounded-lg ${product.isActive ? 'bg-gray-100 hover:bg-gray-200' : 'bg-green-100 hover:bg-green-200'}`}
                      title={product.isActive ? 'Desactivar' : 'Activar'}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setEditingProduct({
                        ...product, 
                        price: product.price.toString(), 
                        stock: product.stock.toString()
                      })}
                      className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
                          deleteProduct(product._id);
                        }
                      }}
                      className="p-3 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Componente AdminOverview
const AdminOverview = ({ setAdminView, user, adminStats, products }) => {
  const activeProducts = adminStats.totalProducts || 0;
  const lowStockProducts = adminStats.lowStockProducts || 0;
  const totalOrders = adminStats.totalOrders || 0;
  const totalSales = adminStats.totalSales || 0;

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-base font-medium">
          Admin: {user.name}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-md">
          <Package className="h-10 w-10 mb-3 text-white/90" />
          <p className="text-sm opacity-90">Productos Activos</p>
          <p className="text-3xl font-bold mt-1">{activeProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-xl shadow-md">
          <Clock className="h-10 w-10 mb-3 text-white/90" />
          <p className="text-sm opacity-90">Stock Bajo</p>
          <p className="text-3xl font-bold mt-1">{lowStockProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl shadow-md">
          <ShoppingCart className="h-10 w-10 mb-3 text-white/90" />
          <p className="text-sm opacity-90">Total Pedidos</p>
          <p className="text-3xl font-bold mt-1">{totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow-md">
          <DollarSign className="h-10 w-10 mb-3 text-white/90" />
          <p className="text-sm opacity-90">Ventas Totales</p>
          <p className="text-2xl font-bold mt-1">₲{totalSales.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <button
          onClick={() => setAdminView('products')}
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left border border-gray-100 hover:border-blue-100 group"
        >
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">Gestionar Productos</h3>
          <p className="text-gray-600 text-sm">Agregar, editar y eliminar</p>
        </button>
        
        <button
          onClick={() => setAdminView('orders')}
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left border border-gray-100 hover:border-green-100 group"
        >
          <div className="flex items-center mb-3">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">Ver Pedidos</h3>
          <p className="text-gray-600 text-sm">Gestionar pedidos</p>
        </button>
      </div>

      {lowStockProducts > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-orange-800 mb-3 flex items-center">
            <span className="text-xl mr-2">⚠️</span> Productos con Stock Bajo
          </h3>
          <div className="space-y-2">
            {products.filter(p => p.isActive && p.stock <= 5).map(product => (
              <div key={product._id} className="flex justify-between items-center py-2 border-b border-orange-100 last:border-b-0">
                <span className="text-base text-orange-900">{product.name}</span>
                <span className="text-base font-bold text-orange-600">Stock: {product.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// PANEL DE ADMINISTRACIÓN - Componente principal corregido
const AdminPanel = ({ 
  user, 
  adminStats, 
  products, 
  loadAdminProducts, 
  newProduct, 
  setNewProduct, 
  resetNewProduct, 
  handleAddProduct, 
  editingProduct, 
  setEditingProduct, 
  handleUpdateProduct, 
  toggleProductActive, 
  deleteProduct 
}) => {
  const [adminView, setAdminView] = useState('overview');

  // Renderizado condicional sin hooks dentro de condicionales
  const renderAdminView = () => {
    switch (adminView) {
      case 'overview':
        return <AdminOverview setAdminView={setAdminView} user={user} adminStats={adminStats} products={products} />;
      case 'products':
        return (
          <AdminProductsView 
            setAdminView={setAdminView}
            loadAdminProducts={loadAdminProducts}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            resetNewProduct={resetNewProduct}
            handleAddProduct={handleAddProduct}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            handleUpdateProduct={handleUpdateProduct}
            toggleProductActive={toggleProductActive}
            deleteProduct={deleteProduct}
            products={products}
          />
        );
      case 'orders':
        return <AdminOrdersView setAdminView={setAdminView} />;
      default:
        return <AdminOverview setAdminView={setAdminView} user={user} adminStats={adminStats} products={products} />;
    }
  };

  return renderAdminView();
};

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [dailyDiscount, setDailyDiscount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminStats, setAdminStats] = useState({});

  // Estados para el panel de admin
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'almacen',
    price: '',
    description: '',
    image: '',
    stock: ''
  });

  // API Functions - usando useCallback
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiRequest('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  }, []);

  const loadAdminStats = useCallback(async () => {
    try {
      const stats = await apiRequest('/admin/stats');
      setAdminStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  const loadAdminProducts = useCallback(async () => {
    try {
      const data = await apiRequest('/admin/products');
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos admin:', error);
    }
  }, []);

  // Cargar usuario al inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAdmin(userData.isAdmin);
    }
    loadProducts();
  }, [loadProducts]);

  // Cargar datos del usuario logueado
  useEffect(() => {
    if (user) {
      loadOrders();
      if (user.isAdmin) {
        loadAdminStats();
      }
    }
  }, [user, loadOrders, loadAdminStats]);

  // Simular descuento diario
  useEffect(() => {
    const discounts = [
      { day: 'Lunes', discount: 10, category: 'almacen', text: '10% OFF en productos de almacén' },
      { day: 'Martes', discount: 15, category: 'comida', text: '15% OFF en comidas preparadas' },
      { day: 'Miércoles', discount: 20, category: 'all', text: '20% OFF en toda la tienda' },
      { day: 'Jueves', discount: 10, category: 'almacen', text: '10% OFF en productos de almacén' },
      { day: 'Viernes', discount: 15, category: 'comida', text: '15% OFF en comidas preparadas' },
      { day: 'Sábado', discount: 25, category: 'delivery', text: '25% OFF en delivery' },
      { day: 'Domingo', discount: 12, category: 'all', text: '12% OFF en toda la tienda' }
    ];
    
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
    const todayDiscount = discounts.find(d => d.day === todayCapitalized);
    setDailyDiscount(todayDiscount);
  }, []);

  // FUNCIONES DE ADMINISTRACIÓN
  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      category: 'almacen',
      price: '',
      description: '',
      image: '',
      stock: ''
    });
  };

  const handleAddProduct = async () => {
    // Validar que todos los campos requeridos estén presentes
    if (!newProduct.name || !newProduct.category || !newProduct.price || 
        !newProduct.description || !newProduct.stock) {
      alert('Por favor completa todos los campos: nombre, categoría, precio, descripción y stock');
      return;
    }
    
    try {
      const productData = {
        name: newProduct.name,
        category: newProduct.category,
        price: parseInt(newProduct.price),
        image: newProduct.image || '📦', // Valor por defecto si no hay imagen
        description: newProduct.description,
        stock: parseInt(newProduct.stock) || 0
      };
      
      await apiRequest('/admin/products', {
        method: 'POST',
        body: productData
      });
      
      resetNewProduct();
      alert('Producto agregado exitosamente');
      loadAdminProducts();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar producto: ' + error.message);
    }
  };

  const handleUpdateProduct = async (id) => {
    if (!editingProduct.name || !editingProduct.price) {
      alert('Por favor completa nombre y precio');
      return;
    }
    
    try {
      await apiRequest(`/admin/products/${id}`, {
        method: 'PUT',
        body: {
          ...editingProduct,
          price: parseInt(editingProduct.price),
          stock: parseInt(editingProduct.stock) || 0
        }
      });
      setEditingProduct(null);
      alert('Producto actualizado exitosamente');
      loadAdminProducts();
    } catch (error) {
      alert('Error al actualizar producto: ' + error.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
      loadAdminProducts();
    } catch (error) {
      alert('Error al eliminar producto: ' + error.message);
    }
  };

  const toggleProductActive = async (id) => {
    const product = products.find(p => p._id === id);
    try {
      await apiRequest(`/admin/products/${id}`, {
        method: 'PUT',
        body: { ...product, isActive: !product.isActive }
      });
      loadAdminProducts();
    } catch (error) {
      alert('Error al cambiar estado del producto: ' + error.message);
    }
  };

  const addToCart = (product) => {
    if (product.stock === 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item._id !== id));
    } else {
      setCart(prev =>
        prev.map(item =>
          item._id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (dailyDiscount) {
      if (dailyDiscount.category === 'all') {
        discount = subtotal * (dailyDiscount.discount / 100);
      } else if (dailyDiscount.category === 'delivery') {
        discount = subtotal * (dailyDiscount.discount / 100);
      } else {
        const categoryTotal = cart
          .filter(item => item.category === dailyDiscount.category)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        discount = categoryTotal * (dailyDiscount.discount / 100);
      }
    }
    
    return { subtotal, discount, total: subtotal - discount };
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAdmin(response.user.isAdmin);
      
      return true;
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
      return false;
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: { email, password, name },
      });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAdmin(response.user.isAdmin);
      
      return true;
    } catch (error) {
      alert('Error al registrarse: ' + error.message);
      return false;
    }
  };

  const processPayment = async (paymentData, deliveryOption) => {
    try {
      const { total } = calculateTotal();
      const finalTotal = total + (deliveryOption === 'delivery' ? 5000 : 0);
      
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: finalTotal,
        paymentMethod: paymentData.method,
        deliveryOption
      };
      
      const order = await apiRequest('/orders', {
        method: 'POST',
        body: orderData,
      });
      
      setCart([]);
      loadProducts(); // Recargar productos para actualizar stock
      return { success: true, orderId: order._id };
    } catch (error) {
      throw new Error('Error al procesar el pago: ' + error.message);
    }
  };

  // Componente de Header
  const Header = () => (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Package className="h-12 w-12 text-white" />
          <h1 className="text-3xl font-bold">Despensa Murillo</h1>
        </div>
        <div className="flex items-center space-x-6">
          {user && (
            <span className="text-base bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              ¡Hola, {user.name}! {user.isAdmin && '👑'}
            </span>
          )}
          <div className="relative">
            <ShoppingCart 
              className="h-8 w-8 cursor-pointer text-white hover:text-blue-100 transition-colors" 
              onClick={() => setCurrentView('cart')}
            />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Descuento Diario
  const DailyDiscountBanner = () => {
    if (!dailyDiscount) return null;
    
    return (
      <div className="bg-gradient-to-r from-blue-400 to-green-500 text-white p-6 m-4 rounded-2xl shadow-lg animate-pulse border-2 border-white/30">
        <div className="flex items-center justify-center space-x-3">
          <Percent className="h-10 w-10" />
          <span className="font-bold text-2xl">¡OFERTA DEL DÍA!</span>
        </div>
        <p className="text-center mt-4 text-xl font-semibold">{dailyDiscount.text}</p>
        <p className="text-center text-base mt-3 opacity-90">📍 Válido solo por hoy</p>
      </div>
    );
  };

  // Componente de Navegación
  const Navigation = () => {
    const navItems = [
      { key: 'home', icon: Home, label: 'Inicio' },
      { key: 'products', icon: Package, label: 'Productos' },
      { key: 'food', icon: Utensils, label: 'Comidas' },
      { key: 'orders', icon: Clock, label: 'Pedidos' },
      { key: 'profile', icon: User, label: 'Perfil' }
    ];

    if (isAdmin) {
      navItems.splice(4, 0, { key: 'admin', icon: Settings, label: 'Admin' });
    }

    return (
      <div className="bg-white/90 backdrop-blur-sm border-t-2 border-blue-100 shadow-xl fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around py-4">
          {navItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                currentView === key 
                  ? 'text-blue-600 bg-blue-50/80 transform -translate-y-2 shadow-md' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Icon className="h-7 w-7" />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Vista de Pedidos
  const OrdersView = () => {
    if (!user) {
      return (
        <div className="p-6 text-center">
          <p className="text-xl mb-5">Inicia sesión para ver tus pedidos</p>
          <button
            onClick={() => setCurrentView('profile')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="p-6 text-center">
          <Clock className="h-20 w-20 text-gray-400 mx-auto mb-5" />
          <p className="text-xl text-gray-600">No tienes pedidos aún</p>
        </div>
      );
    }

    return (
      <div className="p-4 pb-20">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Mis Pedidos</h2>
        <div className="space-y-5">
          {orders.map(order => (
            <div key={order._id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Pedido #{order._id.slice(-6)}</h3>
                  <p className="text-gray-600 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  order.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                  order.status === 'preparando' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                {order.items.map(item => (
                  <div key={item._id} className="flex justify-between text-base py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                    <span className="font-medium">₲{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span className="text-gray-800">Total:</span>
                <span className="text-green-600">₲{order.total.toLocaleString()}</span>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                Pago: {order.paymentMethod === 'bancard' ? 'Bancard' : 
                       order.paymentMethod === 'ueno' ? 'Ueno Bank' : 'Efectivo'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Vista de Login/Register
  const AuthView = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      
      if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
        setError('Por favor completa todos los campos');
        return;
      }
      
      setLoading(true);
      
      let success = false;
      if (isLogin) {
        success = await handleLogin(formData.email, formData.password);
      } else {
        success = await handleRegister(formData.email, formData.password, formData.name);
      }
      
      setLoading(false);
      
      if (!success) {
        setError('Credenciales incorrectas o error del servidor');
      }
    };

    return (
      <div className="max-w-md mx-auto mt-8 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>
          
          {isLogin && (
            <div className="bg-blue-50 p-4 rounded-xl mb-6 text-base">
              <p className="font-medium mb-2">🔑 Acceso Admin:</p>
              <p>Email: admin@despensamurillo.com</p>
              <p>Password: admin123</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-5">
                <label className="block text-gray-700 text-base font-medium mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  placeholder="Tu nombre"
                />
              </div>
            )}
            
            <div className="mb-5">
              <label className="block text-gray-700 text-base font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-base font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-base mb-5">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg text-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
            
            <p className="text-center mt-5 text-base text-gray-600">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 hover:underline ml-2 font-medium"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </form>
        </div>
    );
  };

  // Vista de Inicio
  const HomeView = () => (
    <div className="p-4 pb-20">
      <DailyDiscountBanner />
      
      <div className="grid grid-cols-2 gap-5 mb-8">
        <button
          onClick={() => setCurrentView('products')}
          className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-blue-100"
        >
          <Package className="h-14 w-14 text-blue-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-blue-800 text-center">Productos</h3>
          <p className="text-gray-600 text-sm text-center">Almacén y más</p>
        </button>
        
        <button
          onClick={() => setCurrentView('food')}
          className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-green-100"
        >
          <Utensils className="h-14 w-14 text-green-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-green-800 text-center">Comidas</h3>
          <p className="text-gray-600 text-sm text-center">Preparadas</p>
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-blue-100">
        <h3 className="font-bold text-lg mb-5 text-blue-800">Productos Destacados</h3>
        <div className="grid grid-cols-1 gap-4">
          {products.filter(p => p.isActive).slice(0, 3).map(product => (
            <div key={product._id} className="flex items-center justify-between p-5 bg-blue-50/50 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{product.image}</span>
                <div>
                  <h4 className="font-semibold text-blue-900 text-lg">{product.name}</h4>
                  <p className="text-green-600 font-bold text-lg">₲{product.price.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 text-lg ${
                  product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                }`}
              >
                {product.stock === 0 ? 'Sin stock' : 'Agregar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Vista de Productos
  const ProductsView = ({ category = null }) => {
    let filteredProducts = products.filter(p => p.isActive);
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (loading) {
      return (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-5 text-gray-600 text-lg">Cargando productos...</p>
        </div>
      );
    }

    return (
      <div className="p-4 pb-20">
        <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">
          {category === 'comida' ? '🍗 Comidas Preparadas' : 
          category === 'almacen' ? '📦 Productos de Almacén' : '🛒 Todos los Productos'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
              <div className="text-6xl text-center mb-5">{product.image}</div>
              <h3 className="font-bold text-xl text-blue-800 mb-3 text-center">{product.name}</h3>
              <p className="text-gray-600 text-base mb-5 text-center">{product.description}</p>
              
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-orange-500 text-sm mb-3 font-semibold text-center">
                  ⚡ ¡Últimas {product.stock} unidades!
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  ₲{product.price.toLocaleString()}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 text-lg ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                  }`}
                >
                  {product.stock === 0 ? 'Sin stock' : 'Agregar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Vista del Carrito
  const CartView = () => {
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bancard');
    const [deliveryOption, setDeliveryOption] = useState('delivery');
    
    const { subtotal, discount, total } = calculateTotal();

    const handleCheckout = async () => {
      if (!user) {
        setCurrentView('profile');
        return;
      }

      setIsCheckingOut(true);
      try {
        const result = await processPayment({ method: paymentMethod }, deliveryOption);
        if (result.success) {
          alert(`¡Pedido confirmado! ID: ${result.orderId}`);
          setCurrentView('orders');
        }
      } catch (error) {
        alert(error.message);
      }
      setIsCheckingOut(false);
    };

    if (cart.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 p-6">
          <ShoppingCart className="h-20 w-20 text-gray-400 mb-5" />
          <p className="text-xl text-gray-600 mb-6">Tu carrito está vacío</p>
          <button
            onClick={() => setCurrentView('products')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
          >
            Ver Productos
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 pb-32">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tu Carrito</h2>
        
        <div className="bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100">
          <h3 className="font-bold text-lg mb-3 text-gray-800">Tipo de entrega:</h3>
          <div className="space-y-3">
            <label className="flex items-center text-base">
              <input
                type="radio"
                value="delivery"
                checked={deliveryOption === 'delivery'}
                onChange={(e) => setDeliveryOption(e.target.value)}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <Truck className="h-5 w-5 mr-2 text-blue-500" />
              Delivery (₲5,000)
            </label>
            <label className="flex items-center text-base">
              <input
                type="radio"
                value="pickup"
                checked={deliveryOption === 'pickup'}
                onChange={(e) => setDeliveryOption(e.target.value)}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <Home className="h-5 w-5 mr-2 text-green-500" />
              Retirar en tienda (Gratis)
            </label>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {cart.map(item => (
            <div key={item._id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 flex items-center justify-between border-2 border-blue-100">
              <div className="flex items-center space-x-5">
                <span className="text-4xl">{item.image}</span>
                <div>
                  <h4 className="font-semibold text-blue-800 text-lg">{item.name}</h4>
                  <p className="text-green-600 font-bold text-lg">₲{item.price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-blue-50/50 rounded-full p-2">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm text-lg font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-blue-800 text-lg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Resumen del pedido:</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">₲{subtotal.toLocaleString()}</span>
            </div>
            {deliveryOption === 'delivery' && (
              <div className="flex justify-between text-base">
                <span className="text-gray-700">Delivery:</span>
                <span className="font-medium">₲5,000</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-base text-green-600">
                <span>Descuento:</span>
                <span className="font-medium">-₲{discount.toLocaleString()}</span>
              </div>
            )}
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-xl">
              <span className="text-gray-800">Total:</span>
              <span className="text-green-600">₲{(total + (deliveryOption === 'delivery' ? 5000 : 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm mb-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Método de pago:</h3>
          <div className="space-y-3">
            <label className="flex items-center text-base">
              <input
                type="radio"
                value="bancard"
                checked={paymentMethod === 'bancard'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              Bancard (Tarjeta)
            </label>
            <label className="flex items-center text-base">
              <input
                type="radio"
                value="ueno"
                checked={paymentMethod === 'ueno'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
              Ueno Bank
            </label>
            <label className="flex items-center text-base">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <span className="text-xl mr-2">💰</span> Efectivo (contra entrega)
            </label>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 shadow-md"
        >
          {isCheckingOut ? 'Procesando...' : `Confirmar Pedido - ₲${(total + (deliveryOption === 'delivery' ? 5000 : 0)).toLocaleString()}`}
        </button>
      </div>
    );
  };

  // Renderizado principal
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <AuthView />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%)' }}>
      <Header />
      
      <div className="container mx-auto px-4">
        {currentView === 'home' && <HomeView />}
        {currentView === 'products' && <ProductsView />}
        {currentView === 'food' && <ProductsView category="comida" />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'orders' && <OrdersView />}
        {currentView === 'admin' && (
          <AdminPanel 
            user={user}
            adminStats={adminStats}
            products={products}
            loadAdminProducts={loadAdminProducts}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            resetNewProduct={resetNewProduct}
            handleAddProduct={handleAddProduct}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            handleUpdateProduct={handleUpdateProduct}
            toggleProductActive={toggleProductActive}
            deleteProduct={deleteProduct}
          />
        )}
        {currentView === 'profile' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-5 text-gray-800">Mi Perfil</h2>
            <p className="mb-5 text-lg">Hola, {user.name}!</p>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsAdmin(false);
                setCurrentView('home');
              }}
              className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default App;
  