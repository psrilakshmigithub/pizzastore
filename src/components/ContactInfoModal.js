import React, { useState } from 'react';
import axios from 'axios';

const ContactInfoModal = ({ userId, onSave, onClose }) => {
  const [contact, setContact] = useState({ phone: '', address: '' });
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!contact.phone || !contact.address) {
      setError('Both phone and address are required.');
      return;
    }
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/contacts/default`, contact);
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error.message);
      setError('Failed to save contact.');
    }
  };

  return (
    <div className="modal">
      <h2>Add Contact Information</h2>
      <input
        type="text"
        placeholder="Phone"
        value={contact.phone}
        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
      />
      <input
        type="text"
        placeholder="Address"
        value={contact.address}
        onChange={(e) => setContact({ ...contact, address: e.target.value })}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default ContactInfoModal;
