import React, { useState, useEffect,useContext } from 'react';
import { Outlet, useNavigate,Link } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import '../styles/Layout.css';
import '../styles/main.css'
import logo from '../images/pizza-logo.png';

const Layout = () => {
  const { user, setUser } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setDropdownOpen(false);
    if (storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

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
        <div className="logo">
        <Link to="/">
            <img src={logo} alt="Jumbo 3 for 1 Pizza and Wings" />
          </Link>
         
          </div>
        <nav className="nav-links">
          <ul>
            <li>
              <a href="/"> <i class="fa fa-home" aria-hidden="true"></i> Home</a>
            </li>
            {!user ? (
              <li>
                <a href="/login"><i class="fa fa-user" aria-hidden="true"></i> Login</a>
              </li>
            ) : (
              <li className="user-menu">
                
                <button
                  className="user-menu-button"
                  onClick={toggleDropdown}
                  
                >
                  <i class="fa fa-user" aria-hidden="true"></i> {user.name}
                </button>
                {dropdownOpen && (
                  <div className="user-menu-dropdown active">
                    <ul>
                      <li onMouseDown={() => handleMenuItemClick('/managecontacts')}>
                        My Account
                      </li>
                      <li onMouseDown={() => handleMenuItemClick('/my-orders')}>
                        My Orders
                      </li>
                      <li onMouseDown={handleLogout}>Logout</li>
                    </ul>
                  </div>
                )}
              </li>

            )}
         
              <li>
                <a href="/cart"><i class="fa fa-shopping-cart" aria-hidden="true"></i> Cart</a>
              </li>
           
          </ul>
        </nav>
      </header>

      <div className="main-layout">
        <div className="main-banner">
          <h1>Welcome to Jumbo 3 for 1 Pizza Store</h1>
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
