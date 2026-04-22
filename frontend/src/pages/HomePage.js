import React from 'react';
import { Package, Utensils } from 'lucide-react';
import DailyDiscountBanner from '../components/DailyDiscountBanner';
import { useCart } from '../context/CartContext';

const HomePage = ({ products, dailyDiscount, setCurrentView }) => {
  const { addToCart } = useCart();

  return (
    <div className="p-4 pb-20">
      <DailyDiscountBanner discount={dailyDiscount} />

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
            <div
              key={product._id}
              className="flex items-center justify-between p-5 bg-blue-50/50 rounded-2xl border border-blue-200"
            >
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
};

export default HomePage;
