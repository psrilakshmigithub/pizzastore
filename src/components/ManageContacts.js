import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ContactManagement.css';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places']; // Required for Google Places Autocomplete

const ManageContacts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ phone: '', address: '', isDefault: true });
  const [isAdding, setIsAdding] = useState(false); // Manage visibility of the add contact form
  const [editingContact, setEditingContact] = useState(null); // Track contact being edited
  const [error, setError] = useState('');
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${userId}/contacts`);
        setContacts(response.data);
        console.log("resposne",response.data);
        setIsAdding(response.data.length==0);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, [userId]);

  const handleAddContact = async () => {
    if (!newContact.phone || !newContact.address) {
      setError('Phone and address are required.');
      return;
    }
    setError('');

    const sanitizedContact = { ...newContact };
    delete sanitizedContact.autocomplete;

    try {
      const response = await axios.post(`http://localhost:5000/api/user/${userId}/contacts`, sanitizedContact);
      setContacts(response.data);
      setNewContact({ phone: '', address: '', isDefault: false });
      setIsAdding(false); // Hide form after adding contact
      const fromCheckout = location.state?.fromCheckout;
      if (fromCheckout) {
        navigate('/checkout');
      } 
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact.');
    }
  };

  const handleEditContact = async (contactId) => {
    if (!editingContact.phone || !editingContact.address) {
      setError('Phone and address are required.');
      return;
    }
    setError('');

    const sanitizedContact = { ...editingContact };
    delete sanitizedContact.autocomplete;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/user/${userId}/contacts/${contactId}`,
        sanitizedContact
      );
      setContacts(response.data);
      setEditingContact(null); // Exit editing mode
      const fromCheckout = location.state?.fromCheckout;
      if (fromCheckout) {
        navigate('/checkout');
      } 
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact.');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/user/${userId}/contacts/${contactId}`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact.');
    }
  };

  const handleSetDefault = async (contactId) => {
    try {
      const updatedContact = contacts.find((c) => c._id === contactId);
      updatedContact.isDefault = true;

      await axios.put(`http://localhost:5000/api/user/${userId}/contacts/${contactId}`, updatedContact);
      const updatedContacts = contacts.map((c) =>
        c._id === contactId ? { ...c, isDefault: true } : { ...c, isDefault: false }
      );
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error setting default contact:', error);
    }
  };

  const handlePlaceSelect = (autocomplete, isEditing = false) => {
    const place = autocomplete.getPlace();
    if (place && place.formatted_address) {
      if (isEditing) {
        setEditingContact((prev) => ({
          ...prev,
          address: place.formatted_address,
        }));
      } else {
        setNewContact((prev) => ({
          ...prev,
          address: place.formatted_address,
        }));
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyDry07Si3iUU8GZx99IGFh_UI1fOhlzmwg" libraries={libraries}>
      <div className="contact-management">
        <h1>Manage Contacts</h1>

        {contacts.length === 0 && !isAdding ? (
          <button onClick={() => setIsAdding(true)} className="add-contact-btn">
            Add Contact
          </button>
        ) : null}

        {/* Add Contact Form */}
        {isAdding && (
          <div className="add-contact">
            <h2>Add Contact</h2>
            <input
              type="text"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            />
            <Autocomplete
              onLoad={(autocomplete) => (newContact.autocomplete = autocomplete)}
              onPlaceChanged={() => handlePlaceSelect(newContact.autocomplete)}
            >
              <input
                type="text"
                placeholder="Delivery Address"
                value={newContact.address}
                onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
              />
            </Autocomplete>
            <label>
              <input
                type="radio"
                name="isDefault"
                checked={newContact.isDefault}
                onChange={() => setNewContact({ ...newContact, isDefault: true })}
              />
              Set as Default
            </label>
            <button onClick={handleAddContact}>Save</button>
            <button onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        )}

        {/* Existing Contacts */}
        {contacts.length > 0 && (
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div key={contact._id} className="contact-card">
                {editingContact && editingContact._id === contact._id ? (
                  <>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={editingContact.phone}
                      onChange={(e) => setEditingContact((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                    <Autocomplete
                      onLoad={(autocomplete) => (editingContact.autocomplete = autocomplete)}
                      onPlaceChanged={() => handlePlaceSelect(editingContact.autocomplete, true)}
                    >
                      <input
                        type="text"
                        placeholder="Delivery Address"
                        value={editingContact.address}
                        onChange={(e) =>
                          setEditingContact((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </Autocomplete>
                    <button onClick={() => handleEditContact(contact._id)}>Save</button>
                    <button onClick={() => setEditingContact(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p>Phone: {contact.phone}</p>
                    <p>Address: {contact.address}</p>
                    <label>
                      <input
                        type="radio"
                        name="defaultContact"
                        checked={contact.isDefault}
                        onChange={() => handleSetDefault(contact._id)}
                      />
                      Default
                    </label>
                    <button onClick={() => setEditingContact(contact)}>Edit</button>
                    <button onClick={() => handleDeleteContact(contact._id)}>Delete</button>
                  </>
                )}
              </div>
            ))}
            <button onClick={() => setIsAdding(true)} className="add-contact-btn">
              Add New Contact
            </button>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default ManageContacts;
