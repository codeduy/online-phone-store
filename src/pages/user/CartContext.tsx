import React, { createContext, useState, useContext } from 'react';

interface CartContextType {
  cartItems: any[];
  cartCount: number;
  addToCart: (item: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const addToCart = (item: any) => {
    setCartItems([...cartItems, item]);
    setCartCount(prev => prev + 1);
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    setCartCount(prev => prev - 1);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + delta } : item
    ));
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);