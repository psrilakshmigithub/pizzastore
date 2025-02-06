import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import '../styles/Layout.css';
import '../styles/main.css';
import '../styles/ContactManagement.css';
import logo from '../images/pizza-logo.png';
import sidebarImg from '../images/honey_garlic_wings.jpg';

const libraries = ['places'];

const Layout = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Order type state and modal controls
  const [orderType, setOrderType] = useState(localStorage.getItem('orderType') || '');
  const [orderAddress, setOrderAddress] = useState(localStorage.getItem('orderAddress') || '');
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(!localStorage.getItem('orderType'));
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  
  // For Autocomplete reinitialization
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  const [autocompleteInstance, setAutocompleteInstance] = useState(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
    setDropdownOpen(false);
  }, [setUser]);

  // Open modal if no order type is stored.
  useEffect(() => {
    if (!localStorage.getItem('orderType')) {
      setIsOrderTypeModalOpen(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('orderType');
    localStorage.removeItem('orderAddress');
    setUser(null);
    setOrderType('');
    setOrderAddress('');
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleMenuItemClick = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  // Order Type Modal handlers
  const handleSelectPickup = () => {
    setOrderType('Pickup');
    localStorage.setItem('orderType', 'pickup');
    setIsOrderTypeModalOpen(false);
  };

  const handleSelectDelivery = () => {
    setShowAddressForm(true);
  };

  // Autocomplete handlers
  const handleAutocompleteLoad = (autocomplete) => {
    setAutocompleteInstance(autocomplete);
  };

  const handlePlaceChanged = () => {
    if (autocompleteInstance) {
      const place = autocompleteInstance.getPlace();
      if (place && place.formatted_address) {
        setTempAddress(place.formatted_address);
      }
    }
  };

  const handleSubmitDelivery = () => {
    if (
      tempAddress.trim() === '' ||
      !tempAddress.toLowerCase().includes('guelph') ||
      !tempAddress.toLowerCase().includes('on')
    ) {
      alert('Please enter a valid address within Guelph, Ontario.');
      return;
    }
    setOrderType('Delivery');
    setOrderAddress(tempAddress);
    localStorage.setItem('orderType', 'delivery');
    localStorage.setItem('orderAddress', tempAddress);
    setIsOrderTypeModalOpen(false);
  };

  // Handler to let the user edit the order type.
  const handleEditOrderType = () => {
    // Clear the current order type and address.
    localStorage.removeItem('orderType');
    localStorage.removeItem('orderAddress');
    setOrderType('');
    setOrderAddress('');
    setTempAddress('');
    setShowAddressForm(false);
    // Increment the key to force Autocomplete to remount.
    setAutocompleteKey(prev => prev + 1);
    setIsOrderTypeModalOpen(true);
  };

  return (
    // Wrap the entire Layout with LoadScript so the Maps API is loaded only once.
    <LoadScript googleMapsApiKey="AIzaSyDry07Si3iUU8GZx99IGFh_UI1fOhlzmwg" libraries={libraries}>
      <div className="layout">
        {/* Navbar */}
        <header className="navbar">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="Jumbo 3 for 1 Pizza and Wings" />
            </Link>
          </div>
          <ul style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0 }}>
            {orderType && (
              <li className="order-type-display">
                <span>
                  {orderType === 'Delivery' && orderAddress ? (
                    <p>
                      <i className="fa-solid fa-truck" aria-hidden="true"></i> {orderAddress}
                    </p>
                  ) : (
                    <p>
                      <i className="fa-solid fa-truck-pickup" aria-hidden="true"></i> Pickup :159 Fife Rd,Guelph, ON N1H 7N8
                    </p>
                  )}
                </span>
                <button
                  className="edit-order-type-btn"
                  title="Edit Order Type"
                  onClick={handleEditOrderType}
                  style={{
                    marginLeft: '0.5rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '10%',
                  }}
                >
                  <i className="fa fa-edit" aria-hidden="true"></i>
                </button>
              </li>
            )}
          </ul>
          <nav className="nav-links">
            <ul>
              <li>
                <Link to="/">
                  <i className="fa fa-home" aria-hidden="true"></i> Home
                </Link>
              </li>
              {!user ? (
                <li>
                  <Link to="/login">
                    <i className="fa fa-user" aria-hidden="true"></i> Login
                  </Link>
                </li>
              ) : (
                <li className="user-menu">
                  <button className="user-menu-button" onClick={toggleDropdown}>
                    <i className="fa fa-user" aria-hidden="true"></i> {user.name}
                  </button>
                  {dropdownOpen && (
                    <div className="user-menu-dropdown active">
                      <ul>
                        <li onMouseDown={() => handleMenuItemClick('/managecontacts')}>My Account</li>
                        <li onMouseDown={() => handleMenuItemClick('/my-orders')}>My Orders</li>
                        <li onMouseDown={handleLogout}>Logout</li>
                      </ul>
                    </div>
                  )}
                </li>
              )}
              <li>
                <Link to="/cart">
                  <i className="fa fa-shopping-cart" aria-hidden="true"></i> Cart
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main Layout */}
        <div className="main-layout">
          <div className="main-banner">
            <h2>Welcome to Jumbo 3 for 1 Pizza and Wings</h2>
            <h2>+1(519)836-1818</h2>
            <h3> Address : 159 Fife Road, Guelph </h3><br></br>
            <h3>Sunday - Wednesday opens 11:00 - 11:00</h3>
            <h3>Thursday - Saturday opens 11:00 - 01:00</h3>
          
          
          </div>

          <div className="content-section">
            <main className="main-content">
              <Outlet />
            </main>
            <aside className="sidebar">
              
              <div className="special-offers">
                <h2>Special Offers</h2>
                <h3>Super Bowl Super Combo</h3>
                <img src={sidebarImg}></img>
                <button Link>Order Now </button>
              </div>
            </aside>
          </div>
        </div>

        <footer className="footer">
          <div className='h-footer'>
          <img src={logo} alt="Jumbo 3 for 1 Pizza and Wings" />
          </div>
       
        
          <p>&copy; 2025 Pizza Store. All rights reserved.</p>
        </footer>

        {/* Order Type Selection Modal */}
        {isOrderTypeModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Select Order Type</h2>
              <div className="modal-buttons">
                <button onClick={handleSelectPickup}>Pickup</button>
                <button onClick={handleSelectDelivery}>Delivery</button>
              </div>
              {showAddressForm && (
                <div className="address-form">
                  <label htmlFor="delivery-address">
                    Enter your delivery address (must be in Guelph, ON):
                  </label>
                  <Autocomplete key={autocompleteKey} onLoad={handleAutocompleteLoad} onPlaceChanged={handlePlaceChanged}>
                    <div className="form-group">
                      <input
                        id="delivery-address"
                        type="text"
                        placeholder="Type your address"
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                      />
                    </div>
                  </Autocomplete>
                  <button onClick={handleSubmitDelivery}>Submit Address</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default Layout;
