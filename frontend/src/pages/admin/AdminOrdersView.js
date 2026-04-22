import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminOrdersView = ({ setAdminView }) => {
  const [adminOrders, setAdminOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/admin/orders');
        setAdminOrders(data);
      } catch (error) {
        toast.error('Error al cargar pedidos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (orderId, status) => {
    try {
      await apiRequest(`/admin/orders/${orderId}`, { method: 'PUT', body: { status } });
      setAdminOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  if (loading) return (
    <div className="p-4 pb-20 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestionar Pedidos ({adminOrders.length})</h2>
        <button onClick={() => setAdminView('overview')} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200">← Volver</button>
      </div>

      {adminOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm p-6">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No hay pedidos aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {adminOrders.map(order => (
            <div key={order._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Pedido #{order._id.slice(-6)}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(order.createdAt).toLocaleDateString('es-PY')}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Cliente: {order.user?.email || 'Usuario eliminado'}
                  </p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="preparando">Preparando</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{item.name} ×{item.quantity}</span>
                    <span className="font-medium">₲{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span className="text-gray-800">Total:</span>
                <span className="text-green-600">₲{order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersView;
