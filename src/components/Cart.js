import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user'))?._id;
       
        const response = await axios.get(`http://localhost:5000/api/orders/cart/${userId}`);
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error.message);
      }
    };

    fetchCart();
  }, []);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cartItems.map((item) => (
        <div key={item._id} className="cart-item">
          <h3>{item.productId.name}</h3>
          <p>Price: ${item.totalPrice}</p>
          <p>Quantity: {item.quantity}</p>
        </div>
      ))}
      <button onClick={handleCheckout}>Proceed to Checkout</button>
    </div>
  );
};

export default Cart;
