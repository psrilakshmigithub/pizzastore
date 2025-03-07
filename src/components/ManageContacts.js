import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ContactManagement.css';
import { Autocomplete } from '@react-google-maps/api';

const ManageContacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ phone: '', address: '', isDefault: true });
  const [isAdding, setIsAdding] = useState(false); // Manage visibility of the add contact form
  const [editingContact, setEditingContact] = useState(null); // Track contact being edited  
  const [loading, setLoading] = useState(true); // Add a loading state
  const location = useLocation();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  const [cartItems, setCartItems] = useState([]); // Track cart items

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/contacts`);
        setContacts(response.data);
        setLoading(false); // Set loading to false after fetching data
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    // Fetch contacts and cart items (assume cart items are stored in localStorage or fetched from API)
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cartData); // If using API, replace this with a proper call.

    fetchContacts();
  }, [userId]);

  const handleAddContact = async () => {
    if (!newContact.phone || !newContact.address) {
      alert('Phone and address are required.');
      return;
    }
   
    const sanitizedContact = { ...newContact };
    delete sanitizedContact.autocomplete;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/contacts`, sanitizedContact);
      setContacts(response.data);
      setNewContact({ phone: '', address: '', isDefault: false });
      setIsAdding(false); // Hide form after adding contact
      const from = location.state?.from;
      if (from) {
        navigate(from);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Please enter a valid address within Guelph, Ontario.');
    }
  };

  const handleEditContact = async (contactId) => {
    if (!editingContact.phone || !editingContact.address) {
      alert('Phone and address are required.');
      return;
    }  
    const sanitizedContact = { ...editingContact };
    delete sanitizedContact.autocomplete;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/contacts/${contactId}`,
        sanitizedContact
      );
      setContacts(response.data);
      setEditingContact(null); // Exit editing mode
      const from = location.state?.from;
      if (from) {
        navigate(from);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact.');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/contacts/${contactId}`);
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

      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userId}/contacts/${contactId}`, updatedContact);
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

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching data
  }

  return (
    <div className="contact-management details-container">
      <h1>Manage Contacts</h1>

      {/* Show "Add Contact" button only if there are no contacts and not in "adding" mode */}
      {contacts.length === 0 && !isAdding && (
        <button onClick={() => setIsAdding(true)} className="add-contact-btn">
          Add Contact
        </button>
      )}

      {/* Show buttons */}

      <div className="action-buttons">
  {/* Always show the Home button */}
  <div >
    <a href="/" className="back-btn">
      <i className="fa fa-chevron-left" aria-hidden="true"></i> Home
    </a>
  </div>

 
    <div className="checkout-btn-wrap">
      <a href="/cart" className="checkout-btn">
        <i className="fa fa-shopping-cart" aria-hidden="true"></i> Proceed to Cart
      </a>
    </div>
  
</div>


      {/* Add Contact Form */}
     {/* Add Contact Form */}
{isAdding && (
  <div className="add-contact">
    <h2>Add Contact Details</h2>

    {/* Phone Number Input */}
    <div className="form-group">
      <label htmlFor="phone">Phone No</label>
      <div>
        <input
          type="text"
          placeholder="Enter Phone"
          value={newContact.phone}
          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
        />
      </div>
    </div>

    {/* Address Input with Google Autocomplete */}
    <div className="form-group">
      <label htmlFor="address">Address</label>
      <Autocomplete
        onLoad={(autocomplete) => (newContact.autocomplete = autocomplete)}
        onPlaceChanged={() => handlePlaceSelect(newContact.autocomplete)}
      >
        <input
          type="text"
          placeholder="Type Delivery Address"
          value={newContact.address}
          onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
        />
      </Autocomplete>
    </div>

    {/* Default Contact Checkbox */}
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={newContact.isDefault}
          onChange={() => setNewContact({ ...newContact, isDefault: !newContact.isDefault })}
        />
        Set as Default
      </label>
    </div>

    {/* Save & Cancel Buttons */}
    <button onClick={handleAddContact}>Save</button>
    <button onClick={() => setIsAdding(false)}>Cancel</button>
  </div>
)}

      {/* Existing Contacts */}
{/* Existing Contacts */}
{contacts.length > 0 && (
  <div className="add-contact">
    {contacts.map((contact) => (
      <div key={contact._id} className="contact-card">
        {editingContact && editingContact._id === contact._id ? (
          <>
            <div className="form-group">
              <label>Phone No</label>
              <div>
                <input
                  type="text"
                  placeholder="Phone"
                  value={editingContact.phone}
                  onChange={(e) =>
                    setEditingContact((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
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
            </div>

            {/* Default Contact Checkbox */}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={editingContact.isDefault}
                  onChange={() =>
                    setEditingContact((prev) => ({ ...prev, isDefault: !prev.isDefault }))
                  }
                />
                Set as Default
              </label>
            </div>

            <button onClick={() => handleEditContact(contact._id)}>Save</button>
            <button onClick={() => setEditingContact(null)}>Cancel</button>
          </>
        ) : (
          <>
            <p><i className="fa-solid fa-mobile-screen-button"></i> Phone: {contact.phone}</p>
            <p><i className="fa-solid fa-location-dot"></i> Address: {contact.address}</p>

            {/* Default Contact Checkbox */}
            <label>
              <input
                type="checkbox"
                checked={contact.isDefault}
                onChange={() => handleSetDefault(contact._id)}
              /> Default
            </label>

            <div className="contact-cta">
              <button onClick={() => setEditingContact(contact)}>Edit</button>
              <button className="delete" onClick={() => handleDeleteContact(contact._id)}>Delete</button>
            </div>
          </>
        )}
      </div>
    ))}
    
    <button onClick={() => setIsAdding(true)} className="add-contact-btn">
      <i className="fa-solid fa-plus"></i> <br /> Add New Contact
    </button>
  </div>
)}
    </div>
  );
};

export default ManageContacts;
