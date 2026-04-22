import React, { useState } from 'react';
import { ShoppingCart, Truck, Home, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../services/api';

const CartPage = ({ dailyDiscount, setCurrentView, onOrderPlaced }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bancard');
  const [deliveryOption, setDeliveryOption] = useState('delivery');

  const { cart, updateQuantity, clearCart, calculateTotal } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const { subtotal, discount, total } = calculateTotal(dailyDiscount);
  const deliveryCost = deliveryOption === 'delivery' ? 5000 : 0;
  const finalTotal = total + deliveryCost;

  const handleCheckout = async () => {
    if (!user) {
      setCurrentView('profile');
      return;
    }
    setIsCheckingOut(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: finalTotal,
        paymentMethod,
        deliveryOption,
      };
      const order = await apiRequest('/orders', { method: 'POST', body: orderData });
      clearCart();
      onOrderPlaced();
      toast.success(`¡Pedido #${order._id.slice(-6)} confirmado!`);
      setCurrentView('orders');
    } catch (error) {
      toast.error(error.message || 'Error al procesar el pedido');
    } finally {
      setIsCheckingOut(false);
    }
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

      {/* Delivery option */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100">
        <h3 className="font-bold text-lg mb-3 text-gray-800">Tipo de entrega:</h3>
        <div className="space-y-3">
          <label className="flex items-center text-base cursor-pointer">
            <input type="radio" value="delivery" checked={deliveryOption === 'delivery'} onChange={(e) => setDeliveryOption(e.target.value)} className="mr-3 h-5 w-5 text-blue-600" />
            <Truck className="h-5 w-5 mr-2 text-blue-500" />
            Delivery (₲5,000)
          </label>
          <label className="flex items-center text-base cursor-pointer">
            <input type="radio" value="pickup" checked={deliveryOption === 'pickup'} onChange={(e) => setDeliveryOption(e.target.value)} className="mr-3 h-5 w-5 text-blue-600" />
            <Home className="h-5 w-5 mr-2 text-green-500" />
            Retirar en tienda (Gratis)
          </label>
        </div>
      </div>

      {/* Cart items */}
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
              <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 shadow-sm text-lg font-bold">-</button>
              <span className="w-10 text-center font-bold text-blue-800 text-lg">{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm text-lg font-bold">+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Resumen del pedido:</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-base"><span className="text-gray-700">Subtotal:</span><span className="font-medium">₲{subtotal.toLocaleString()}</span></div>
          {deliveryCost > 0 && (
            <div className="flex justify-between text-base"><span className="text-gray-700">Delivery:</span><span className="font-medium">₲{deliveryCost.toLocaleString()}</span></div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-base text-green-600"><span>Descuento del día:</span><span className="font-medium">-₲{Math.round(discount).toLocaleString()}</span></div>
          )}
          <hr className="my-3" />
          <div className="flex justify-between font-bold text-xl"><span className="text-gray-800">Total:</span><span className="text-green-600">₲{finalTotal.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Método de pago:</h3>
        <div className="space-y-3">
          <label className="flex items-center text-base cursor-pointer">
            <input type="radio" value="bancard" checked={paymentMethod === 'bancard'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 h-5 w-5 text-blue-600" />
            <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
            Bancard (Tarjeta)
          </label>
          <label className="flex items-center text-base cursor-pointer">
            <input type="radio" value="ueno" checked={paymentMethod === 'ueno'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 h-5 w-5 text-blue-600" />
            <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
            Ueno Bank
          </label>
          <label className="flex items-center text-base cursor-pointer">
            <input type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 h-5 w-5 text-blue-600" />
            <span className="text-xl mr-2">💰</span> Efectivo (contra entrega)
          </label>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isCheckingOut}
        className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 shadow-md"
      >
        {isCheckingOut ? 'Procesando...' : `Confirmar Pedido — ₲${finalTotal.toLocaleString()}`}
      </button>
    </div>
  );
};

export default CartPage;
