import React from 'react';
import { useCart } from '../context/CartContext';

const ProductsPage = ({ products, category, loading }) => {
  const { addToCart } = useCart();

  let filtered = products.filter(p => p.isActive);
  if (category) filtered = filtered.filter(p => p.category === category);

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
        {category === 'comida'  ? '🍗 Comidas Preparadas'      :
         category === 'almacen' ? '📦 Productos de Almacén'    : '🛒 Todos los Productos'}
      </h2>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-10">No hay productos disponibles</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(product => (
            <div
              key={product._id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-blue-100"
            >
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
      )}
    </div>
  );
};

export default ProductsPage;
