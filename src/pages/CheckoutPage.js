import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Checkout.css';

const CheckoutPage = () => {
  // Retrieve order type from localStorage; if not found, default to "pickup"
  const [deliveryType, setDeliveryType] = useState(
    localStorage.getItem('orderType') || 'pickup'
  );
  const [contactInfo, setContactInfo] = useState({ phone: '', address: '' });
  const [scheduledTime, setScheduledTime] = useState('');
  const [instructions, setInstructions] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  // Whenever deliveryType changes, update localStorage.
  useEffect(() => {
    localStorage.setItem('orderType', deliveryType);
  }, [deliveryType]);

  // Fetch user contact info if the delivery type is delivery.
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${userId}/default-contact`);
        const defaultContact = response.data;
        if (defaultContact) {
          setContactInfo({
            phone: defaultContact.phone,
            address: defaultContact.address,
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error.message);
      }
    };

    if (deliveryType === 'delivery' && userId) {
      fetchContactInfo();
    }
  }, [deliveryType, userId, location.key]);

  const handleOrderConfirmation = async () => {
    try {
      const payload = {
        userId,
        deliveryType,
        contactInfo: deliveryType === 'delivery' ? contactInfo : null,
        scheduledTime: scheduledTime || null,
        instructions,
      };

      const response = await axios.post('http://localhost:5000/api/cart/confirm', payload);
      alert('Order confirmed successfully!');
      navigate('/Payment');
    } catch (error) {
      console.error('Error confirming order:', error.message);
      alert('Failed to confirm order.');
    }
  };

  const handleEditContact = () => {
    // Navigate to the ManageContacts page so the user can update their contact info.
    navigate('/managecontacts', { state: { fromCheckout: true } });
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {/* Delivery Type Selection */}
      <div className="form-group">
        <label>Delivery Type:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="deliveryType"
              value="pickup"
              checked={deliveryType === 'pickup'}
              onChange={(e) => setDeliveryType(e.target.value)}
            />
            Pickup
          </label>
          <label>
            <input
              type="radio"
              name="deliveryType"
              value="delivery"
              checked={deliveryType === 'delivery'}
              onChange={(e) => setDeliveryType(e.target.value)}
            />
            Delivery
          </label>
        </div>
      </div>

      {/* Contact Information for Delivery */}
      {deliveryType === 'delivery' && (
        <div className="form-group">
          <label>Contact Information:</label>
          {contactInfo.phone && contactInfo.address ? (
            <>
              <p>Phone: {contactInfo.phone}</p>
              <p>Address: {contactInfo.address}</p>
              <button className="edit-contact-btn" onClick={handleEditContact}>
                Edit Contact Information
              </button>
            </>
          ) : (
            <button className="edit-contact-btn" onClick={handleEditContact}>
              Add Contact Information
            </button>
          )}
        </div>
      )}

      {/* Schedule Order */}
      <div className="form-group">
        <label>Schedule Your Order (Optional):</label>
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
      </div>

      {/* Special Instructions */}
      <div className="form-group">
        <label>Special Instructions:</label>
        <textarea
          placeholder="Add any special instructions for your order"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        ></textarea>
      </div>

      <button className="confirm-order-btn" onClick={handleOrderConfirmation}>
        Confirm Order
      </button>
    </div>
  );
};

export default CheckoutPage;
