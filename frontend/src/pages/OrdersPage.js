import React from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  confirmado: 'bg-green-100 text-green-800',
  preparando:  'bg-yellow-100 text-yellow-800',
  enviado:     'bg-blue-100 text-blue-800',
  entregado:   'bg-purple-100 text-purple-800',
};

const PAYMENT_LABELS = {
  bancard: 'Bancard',
  ueno:    'Ueno Bank',
  cash:    'Efectivo',
};

const OrdersPage = ({ orders, setCurrentView }) => {
  const { user } = useAuth();

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
                <p className="text-gray-600 text-sm mt-1">
                  {new Date(order.createdAt).toLocaleDateString('es-PY')}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {order.items.map(item => (
                <div key={item._id} className="flex justify-between text-base py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-700">{item.name} ×{item.quantity}</span>
                  <span className="font-medium">₲{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span className="text-gray-800">Total:</span>
              <span className="text-green-600">₲{order.total.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Pago: {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
