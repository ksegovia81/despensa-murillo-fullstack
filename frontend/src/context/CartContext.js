import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

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
        prev.map(item => item._id === id ? { ...item, quantity } : item)
      );
    }
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const calculateTotal = (dailyDiscount) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;

    if (dailyDiscount) {
      if (dailyDiscount.category === 'all' || dailyDiscount.category === 'delivery') {
        discount = subtotal * (dailyDiscount.discount / 100);
      } else {
        const categoryTotal = cart
          .filter(item => item.category === dailyDiscount.category)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
        discount = categoryTotal * (dailyDiscount.discount / 100);
      }
    }

    return { subtotal, discount, total: subtotal - discount };
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, cartCount, calculateTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
