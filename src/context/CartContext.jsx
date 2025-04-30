// src/context/CartContext.jsx

import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({ print: [], stationery: [] });

  const addToCart = (type, item) => {
    setCartItems((prev) => ({
      ...prev,
      [type]: [...prev[type], item],
    }));
  };

  const removeFromCart = (type, index) => {
    setCartItems((prev) => {
      const updated = [...prev[type]];
      updated.splice(index, 1);
      return {
        ...prev,
        [type]: updated,
      };
    });
  };

  const clearCart = () => {
    setCartItems({ print: [], stationery: [] });
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
