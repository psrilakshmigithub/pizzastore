import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContactInfoModal from '../components/ContactInfoModal';

const CheckoutPage = () => {
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [contactInfo, setContactInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDefaultContact = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${userId}/default-contact`);
        setContactInfo(response.data || null);
      } catch (error) {
        console.error('Error fetching default contact:', error.message);
      }
    };

    if (deliveryType === 'delivery') {
      fetchDefaultContact();
    }
  }, [deliveryType, userId]);

  const handleConfirm = () => {
    if (deliveryType === 'delivery' && !contactInfo) {
      setShowModal(true);
      return;
    }

    // Navigate to review order page
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div>
        <label>
          <input
            type="radio"
            value="pickup"
            checked={deliveryType === 'pickup'}
            onChange={() => setDeliveryType('pickup')}
          />
          Pickup
        </label>
        <label>
          <input
            type="radio"
            value="delivery"
            checked={deliveryType === 'delivery'}
            onChange={() => setDeliveryType('delivery')}
          />
          Delivery
        </label>
      </div>

      {deliveryType === 'delivery' && contactInfo && (
        <div>
          <p>Phone: {contactInfo.phone}</p>
          <p>Address: {contactInfo.address}</p>
          <button onClick={() => setShowModal(true)}>Edit Contact</button>
        </div>
      )}

      <button onClick={handleConfirm}>Confirm</button>

      {showModal && (
        <ContactInfoModal
          userId={userId}
          onSave={(newContact) => setContactInfo(newContact)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
