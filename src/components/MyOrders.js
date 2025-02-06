import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MyOrders.css';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${userId}`);
        setOrders(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <div className="my-orders-container details-container">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h2>Order #{order._id}</h2>
               
                <span className={`order-status ${order.status.toLowerCase()}`}>
              {order.isOrderConfirmed ? order.status : 'Order not confirmed'}
            </span>
              </div>
              <div className="order-body">
                <div className="order-info">
                  <p className="order-total">
                    <strong>Total:</strong> ${order.totalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item._id} className="order-item-details">
                      <div className="order-item-left">
                        <img
                          src={`${process.env.REACT_APP_API_BASE_URL}${item.productId.image}`}
                          alt={item.productId.name}
                          className="order-item-image"
                        />
                      </div>
                      <div className="order-item-middle">
                        <p className="item-name">{item.productId.name}</p>
                        <p className="item-quantity">Qty: {item.quantity}</p>
                      </div>
                      <div className="order-item-right">
                        <p className="item-price">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;