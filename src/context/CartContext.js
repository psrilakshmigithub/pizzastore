import React, { createContext, useReducer, useContext, useEffect } from 'react';
import axios from 'axios';

// Create Context
export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload.items, totalPrice: action.payload.totalPrice };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload], totalPrice: state.totalPrice + action.payload.price * action.payload.quantity };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload._id),
        totalPrice: state.totalPrice - action.payload.price * action.payload.quantity,
      };
    case 'CLEAR_CART':
      return { items: [], totalPrice: 0 };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  totalPrice: 0,
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Fetch cart data on app load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: 'SET_CART', payload: response.data });
      } catch (err) {
        console.error(err);
      }
    };
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
