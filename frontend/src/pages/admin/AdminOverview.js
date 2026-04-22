import React from 'react';
import { Package, Clock, ShoppingCart, DollarSign, Percent } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ color, icon: Icon, label, value }) => (
  <div className={`bg-gradient-to-br ${color} text-white p-5 rounded-xl shadow-md`}>
    <Icon className="h-10 w-10 mb-3 text-white/90" />
    <p className="text-sm opacity-90">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const NavCard = ({ color, icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left border border-gray-100 group"
  >
    <div className="flex items-center mb-3">
      <div className={`${color} p-3 rounded-lg transition-colors`}>
        <Icon className="h-8 w-8" />
      </div>
    </div>
    <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </button>
);

const AdminOverview = ({ setAdminView, adminStats, products }) => {
  const { user } = useAuth();
  const { totalProducts = 0, lowStockProducts = 0, totalOrders = 0, totalSales = 0 } = adminStats;

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-base font-medium">
          Admin: {user?.name}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <StatCard color="from-blue-500 to-blue-600"     icon={Package}      label="Productos Activos" value={totalProducts} />
        <StatCard color="from-orange-500 to-orange-600" icon={Clock}         label="Stock Bajo"        value={lowStockProducts} />
        <StatCard color="from-green-500 to-green-600"   icon={ShoppingCart}  label="Total Pedidos"     value={totalOrders} />
        <StatCard color="from-purple-500 to-purple-600" icon={DollarSign}    label="Ventas Totales"    value={`₲${totalSales.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <NavCard color="bg-blue-100 text-blue-600"   icon={Package} title="Gestionar Productos" description="Agregar, editar y eliminar" onClick={() => setAdminView('products')} />
        <NavCard color="bg-green-100 text-green-600" icon={Clock}   title="Ver Pedidos"          description="Gestionar pedidos"         onClick={() => setAdminView('orders')} />
        <NavCard color="bg-purple-100 text-purple-600" icon={Percent} title="Descuentos Diarios" description="Configurar ofertas"         onClick={() => setAdminView('discounts')} />
      </div>

      {lowStockProducts > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
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

export default AdminOverview;
