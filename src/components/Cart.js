import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css'; // Ensure the CSS file exists

const Cart = () => {
  const [cartItems, setCartItems] = useState([]); // Initialize as an array
  const [tipPercentage, setTipPercentage] = useState(0);
  const [taxRate] = useState(0.13); // Example: 13% tax
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    (async () => {
      if (!userId) {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        const populatedCart = await fetchProductDetails(localCart);
        setCartItems(
          populatedCart.map((item) => ({
            ...item,
            totalPrice: (item.productId.price || 0) * item.quantity, // Ensure totalPrice exists
          }))
        );
      } else {
        try {
          const response = await axios.get(`http://localhost:5000/api/orders/cart/${userId}`);
          setCartItems(response.data || []); // Ensure an array is set
        } catch (error) {
          console.error('Error fetching cart:', error.message);
        }
      }
    })();
  }, [userId]);

  const calculateSubtotal = () =>
    cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);

  const calculateTax = (subtotal) => subtotal * taxRate;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const tip = (subtotal * tipPercentage) / 100;
    return (subtotal + tax + tip).toFixed(2);
  };

  const fetchProductDetails = async (cart) => {
    const updatedCart = await Promise.all(
      cart.map(async (item) => {
        try {
          const response = await axios.get(`http://localhost:5000/api/products/${item.productId}`);
          return {
            ...item,
            productId: response.data, // Populate product details
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error.message);
          return null; // Return null for failed items
        }
      })
    );
    const filteredCart = updatedCart.filter((item) => item !== null); // Exclude failed items
    localStorage.setItem(
      'cart',
      JSON.stringify(
        filteredCart.map((item) => ({
          ...item,
          productId: item.productId._id, // Store only product ID
        }))
      )
    );
    return filteredCart;
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      if (userId) {
        const response = await axios.put(`http://localhost:5000/api/orders/cart/${itemId}`, {
          userId,
          quantity: newQuantity,
        });
        setCartItems(response.data || []); // Update the cart with the new data
      } else {
        const updatedCart = cartItems.map((item) =>
          item.productId._id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * (item.productId.price || 0), // Recalculate totalPrice
              }
            : item
        );
        setCartItems(updatedCart);
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updatedCart.map((item) => ({
              ...item,
              productId: item.productId._id, // Store only product ID
            }))
          )
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      if (userId) {
        const response = await axios.delete(`http://localhost:5000/api/orders/cart/${itemId}`, {
          data: { userId },
        });
        setCartItems(response.data || []);
      } else {
        const updatedCart = cartItems.filter((item) => item.productId._id !== itemId);
        setCartItems(updatedCart);
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updatedCart.map((item) => ({
              ...item,
              productId: item.productId._id, // Store only product ID
            }))
          )
        );
      }
    } catch (error) {
      console.error('Error deleting item:', error.message);
    }
  };

  const handleCheckout = () => {
    if (!userId) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.productId._id} className="cart-item">
              <img
                src={`http://localhost:5000${item.productId.image}`}
                alt={item.productId.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h3>{item.productId.name}</h3>
                <p>Price: ${item.productId.price.toFixed(2)}</p>
                <div className="cart-item-quantity">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.productId._id, parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <p>Total: ${(item.quantity * item.productId.price).toFixed(2)}</p>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteItem(item.productId._id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <p>Subtotal: ${calculateSubtotal().toFixed(2)}</p>
            <p>HST (13%): ${calculateTax(calculateSubtotal()).toFixed(2)}</p>
            <div className="tip-selection">
              <label htmlFor="tip">Tip:</label>
              <select
                id="tip"
                value={tipPercentage}
                onChange={(e) => setTipPercentage(parseInt(e.target.value, 10))}
              >
                <option value={0}>None</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
                <option value={25}>25%</option>
                <option value={50}>50%</option>
              </select>
            </div>
            <h3>Total: ${calculateTotal()}</h3>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
