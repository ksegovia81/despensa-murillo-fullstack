import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = ({ onCartClick }) => {
  const { user } = useAuth();
  const { cartCount } = useCart();

  return (
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
              onClick={onCartClick}
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
