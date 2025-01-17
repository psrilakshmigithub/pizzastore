import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login'); // Redirect to login page after logout
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const handleMenuItemClick = (path) => {
    setDropdownOpen(false); // Close dropdown after navigation
    navigate(path);
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="logo">Jumbo 3 for 1 Pizza and Wings</div>
        <nav className="nav-links">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            {!user ? (
              <li>
                <a href="/login">Login</a>
              </li>
            ) : (
              <li className="user-menu">
                <button
                  className="user-menu-button"
                  onClick={toggleDropdown}
                  onBlur={closeDropdown}
                >
                  {user.name}
                </button>
                {dropdownOpen && (
                  <div className="user-menu-dropdown active">
                    <ul>
                      <li onMouseDown={() => handleMenuItemClick('/managecontacts')}>
                        My Account
                      </li>
                      <li onMouseDown={() => handleMenuItemClick('/orders')}>
                        My Orders
                      </li>
                      <li onMouseDown={handleLogout}>Logout</li>
                    </ul>
                  </div>
                )}
              </li>

            )}
         
              <li>
                <a href="/cart">Cart</a>
              </li>
           
          </ul>
        </nav>
      </header>

      <div className="main-layout">
        <div className="main-banner">
          <h1>Welcome to Pizza Store</h1>
          <p>Your one-stop destination for delicious pizzas, combos, and more!</p>
        </div>
        <div className="content-section">
          <main className="main-content">
            <Outlet />
          </main>
          <aside className="sidebar">
            <h2>Special Offers</h2>
            <ul>
              <li>Buy 1 Get 1 Free on Large Pizzas</li>
              <li>Free Garlic Bread with Every Combo</li>
              <li>Discounted Beverages with Family Deals</li>
            </ul>
          </aside>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 Pizza Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
