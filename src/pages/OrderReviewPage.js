import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/OrderReviewPage.css';

const OrderReviewPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [orderType, setOrderType] = useState('pickup'); // Default to pickup
  const [scheduledTime, setScheduledTime] = useState('');
  const [tip, setTip] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/cart/${userId}`);
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [userId]);

  const calculateTotalPrice = () => {
    const subtotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
    return (subtotal + parseFloat(tip)).toFixed(2);
  };

  const handleQuantityChange = async (orderId, newQuantity) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/orders/cart/${orderId}`, {
        quantity: newQuantity,
      });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === orderId ? { ...item, quantity: newQuantity, totalPrice: response.data.totalPrice } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (orderId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`);
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== orderId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleConfirmOrder = async () => {
    if (orderType === 'delivery' && !deliveryAddress) {
      setError('Delivery address is required for delivery.');
      return;
    }

    setError('');
    const orderDetails = {
      orderType,
      scheduledTime,
      tip: parseFloat(tip),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/orders/confirm`, orderDetails);
      navigate('/payment'); // Redirect to the payment page
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Failed to confirm order.');
    }
  };

  return (
    <div className="order-review-container">
      <h1>Order Review</h1>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img
              src={`${process.env.REACT_APP_API_BASE_URL}${item.productId.image}`}
              alt={item.productId.name}
              className="cart-item-image"
            />
            <div className="cart-item-details">
              <h3>{item.productId.name}</h3>
              <p>Size: {item.size || 'N/A'}</p>
              <p>Flavor: {item.wingsFlavor || 'N/A'}</p>
              <p>Sides: {item.sides?.join(', ') || 'N/A'}</p>
              <p>Drinks: {item.drinks?.map((d) => `${d.name} (x${d.quantity})`).join(', ') || 'N/A'}</p>
              <p>Toppings: {item.toppings?.join(', ') || 'N/A'}</p>
              <p>Price: ${item.totalPrice.toFixed(2)}</p>
              <div className="quantity-controls">
                <button onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>+</button>
              </div>
              <button className="remove-item-btn" onClick={() => handleRemoveItem(item._id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <div className="order-type">
          <label>
            <input
              type="radio"
              value="pickup"
              checked={orderType === 'pickup'}
              onChange={() => setOrderType('pickup')}
            />
            Pickup
          </label>
          <label>
            <input
              type="radio"
              value="delivery"
              checked={orderType === 'delivery'}
              onChange={() => setOrderType('delivery')}
            />
            Delivery
          </label>
        </div>

        {orderType === 'delivery' && (
          <input
            type="text"
            placeholder="Enter delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        )}

        <div className="scheduled-time">
          <label>Schedule Time:</label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>

        <div className="tip-section">
          <label>Add a Tip ($):</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
          />
        </div>

        <div className="total-price">
          <p>Total Price: ${calculateTotalPrice()}</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="confirm-order-btn" onClick={handleConfirmOrder}>
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default OrderReviewPage;
