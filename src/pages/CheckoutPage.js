import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Checkout.css';

const CheckoutPage = () => {
  const [deliveryType, setDeliveryType] = useState(localStorage.getItem('orderType') || 'pickup');
  const [contactInfo, setContactInfo] = useState({ phone: '', address: '' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneEditable, setIsPhoneEditable] = useState(false); // Toggle phone number edit mode
  const [scheduledTime, setScheduledTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPhoneRequired, setIsPhoneRequired] = useState(false); // To check if phone is required for pickup

  const navigate = useNavigate();
  const location = useLocation();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  // When deliveryType changes, store it in localStorage
  useEffect(() => {
    localStorage.setItem('orderType', deliveryType);
  }, [deliveryType]);

  // Fetch user contact info if the delivery type is delivery
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/default-contact`);
        console.log('Default Contact:', response.data);
        const defaultContact = response.data;
        if (defaultContact) {
          setContactInfo({
            phone: defaultContact.phone,
            address: defaultContact.address,
          });
          setPhoneNumber(defaultContact.phone); // Initialize phoneNumber with the fetched phone
        }
      } catch (error) {
        console.error('Error fetching contact info:', error.message);
      }
    };

    if (userId) {
      fetchContactInfo();
    }

    // For pickup, check if phone is missing and set phone required flag
    if (deliveryType === 'pickup' && !contactInfo.phone) {
      setIsPhoneRequired(true);
    } else {
      setIsPhoneRequired(false);
    }
  }, [deliveryType, userId, contactInfo.phone]);

  const updateDefaultPhone = async (userId, phone) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/contacts/default/${phone}`
      );
      console.log('Updated Default Contact:', response.data);
    } catch (error) {
      console.error('Error updating default contact phone:', error.message);
    }
  };

  const handleOrderConfirmation = async () => {
    try {
      if (isPhoneRequired && !phoneNumber) {
        alert('Please provide a phone number for pickup.');
        return;
      }

      // If phone is updated for pickup, save it
      if (isPhoneRequired && phoneNumber) {
        updateDefaultPhone(userId, phoneNumber);
      }

      const payload = {
        userId,
        deliveryType,
        contactInfo: deliveryType === 'delivery' ? contactInfo : { phone: phoneNumber, address: contactInfo.address },
        scheduledTime: scheduledTime || null,
        instructions,
      };

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/cart/confirm`, payload);
      alert('Order confirmed successfully!');
      navigate('/Payment');
    } catch (error) {
      console.error('Error confirming order:', error.message);
      alert('Failed to confirm order.');
    }
  };

  const handleEditContact = () => {
    setIsPhoneEditable(true);
  };

  const handleCancelEdit = () => {
    setIsPhoneEditable(false);
    setPhoneNumber(contactInfo.phone); // Reset to current phone number
  };
 
  
  const handleSavePhone = async () => {
    if (!phoneNumber) {
      alert("Phone number cannot be empty!");
      return;
    }
  
    try {
      await updateDefaultPhone(userId, phoneNumber); // Save to backend
      setContactInfo((prev) => ({ ...prev, phone: phoneNumber })); // Update local state
      setIsPhoneEditable(false); // Exit edit mode
      alert("Phone number updated successfully!");
    } catch (error) {
      console.error("Error updating phone number:", error.message);
      alert("Failed to update phone number.");
    }
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

      {/* Contact Information for Pickup */}
      {deliveryType === 'pickup' && (
  <div className="form-group">
    <label>Phone Number (Required for Pickup):</label>
    {!isPhoneEditable ? (
      <div>
        <p>Phone: {phoneNumber || 'Not Provided'}</p>
        <button className="edit-phone-btn" onClick={handleEditContact}>
          Edit Phone
        </button>
      </div>
    ) : (
      <div>
        <input
          type="text"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <div className="button-group">
          <button className="save-phone-btn" onClick={handleSavePhone}>
            Save
          </button>
          <button className="cancel-edit-btn" onClick={handleCancelEdit}>
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
)}

      {/* Contact Information for Delivery */}
      {deliveryType === 'delivery' && (
        <div className="form-group">
          <label>Contact Information:</label>
          {contactInfo.phone && contactInfo.address ? (
            <>
              <p>Phone: {contactInfo.phone}</p>
              <p>Address: {contactInfo.address}</p>
              <button className="edit-contact-btn" onClick={() => navigate('/managecontacts')}>
                Edit Contact Information
              </button>
            </>
          ) : (
            <button className="edit-contact-btn" onClick={() => navigate('/managecontacts')}>
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
