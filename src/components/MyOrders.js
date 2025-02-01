import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MyOrders.css';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-item">
              <h2>Order ID: {order._id}</h2>
              <p>Total Price: ${order.totalPrice.toFixed(2)}</p>
              <p>Status: {order.status}</p>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item._id} className="order-item-details">                              
                    <img src={`http://localhost:5000${item.productId.image}`}
                     alt={item.productId.name} className="cart-item-image" />
                    
                    <div className="item-details">
                      <p>{item.productId.name}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;