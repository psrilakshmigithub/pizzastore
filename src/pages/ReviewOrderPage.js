import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ReviewOrderPage = () => {
  const { items, totalPrice } = useCart();
  const [checkoutDetails, setCheckoutDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedDetails = JSON.parse(localStorage.getItem('checkoutDetails'));
    if (storedDetails) setCheckoutDetails(storedDetails);
  }, []);

  return (
    <div className="container">
      <h2>Review Order</h2>
      <div className="card">
        <h3>Delivery Details</h3>
        <p><strong>Method:</strong> {checkoutDetails.deliveryMethod}</p>
        <p><strong>Time:</strong> {checkoutDetails.deliveryTime}</p>
        <p><strong>Note:</strong> {checkoutDetails.note}</p>
      </div>
      <div className="card">
        <h3>Order Summary</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.menuId.name}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Total: ${totalPrice.toFixed(2)}</h3>
      </div>
      <button onClick={() => navigate('/payment')}>Proceed to Payment</button>
    </div>
  );
};

export default ReviewOrderPage;
