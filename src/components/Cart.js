import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css'; // Ensure the CSS file exists

// Utility function to generate a unique ID
const generateUniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const Cart = ({ storeOpen }) => {
  const [cartItems, setCartItems] = useState([]); // Initialize as an array
  const [tipPercentage, setTipPercentage] = useState(10); 
  const [taxRate] = useState(0.13); // Example: 13% tax
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchCartItems = async () => {
      console.log("userId", userId);
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (!userId || localCart.length > 0) {
        console.log("Not logged in or using local cart");
        const populatedCart = await fetchProductDetails(localCart);
        // For each item, calculate the total price using product price and quantity
        setCartItems(
          Array.isArray(populatedCart)
            ? populatedCart.map((item) => ({
                ...item,
                totalPrice: ((item.priceByQuantity || item.productId.price) * item.quantity),               
              }))
            : []
        );
      } else {
        try {
          console.log("User logged in");
          const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
          console.log("response for userId", response.data);
          setCartItems(Array.isArray(response.data.items) ? response.data.items : []); 
          console.log("Fetched cart items:", response.data.items);
        } catch (error) {
          console.error('Error fetching cart:', error.message);
        }
      }
    };

    fetchCartItems();
  }, [userId]);

  // Ensure each cart item from localStorage has a unique _id.
  const fetchProductDetails = async (cart) => {
    const updatedCart = await Promise.all(
      cart.map(async (item) => {
        try {
          const response = await axios.get(`http://localhost:5000/api/products/${item.productId}`);
          return {
            ...item,
            // If no unique id exists, generate one
            _id: item._id || generateUniqueId(),
            productId: response.data, // Populate product details
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error.message);
          return null; // Return null for failed items
        }
      })
    );
    const filteredCart = updatedCart.filter((item) => item !== null);
    // Store back in localStorage with the unique _id and productId only as a string.
    localStorage.setItem(
      'cart',
      JSON.stringify(
        filteredCart.map((item) => ({
          ...item,
          _id: item._id,
          productId: item.productId._id, // Save only product ID for persistence
        }))
      )
    );
    return filteredCart;
  };

  const calculateSubtotal = () =>
  
  cartItems.reduce(
    (total, item) => total + (item.totalPrice || ((item.priceByQuantity || item.productId.price) * item.quantity)),
    0
  );


  const calculateTax = (subtotal) => subtotal * taxRate; 

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const tip = (subtotal * tipPercentage) / 100;
   
    return (subtotal + tax + tip).toFixed(2);
  };

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      // If user is logged in, update via API.
      if (userId && localCart.length === 0) {
        console.log("Logged in: updating quantity");
        const response = await axios.put(`http://localhost:5000/api/cart/${userId}/${itemId}`, { quantity });
        console.log("Response after quantity update:", response.data);
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } else {
        // Update only the specific cart item using its unique _id.
       
        const updatedCart = cartItems.map((item) =>
          item._id === itemId
            ? {
                ...item,
                quantity,                
                totalPrice: (item.priceByQuantity || item.productId.price) * quantity,
              }
            : item
        );
        console.log("Updated Cart:", updatedCart);
        setCartItems(updatedCart);
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updatedCart.map((item) => ({
              ...item,
              _id: item._id,
              productId: item.productId._id, // Save only product ID
            }))
          )
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (userId && localCart.length === 0) {
        const response = await axios.delete(`http://localhost:5000/api/cart/${userId}/${itemId}`);
        console.log("Response after deletion:", response.data);
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } else {
        const updatedCart = cartItems.filter((item) => item._id !== itemId);
        setCartItems(updatedCart);
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updatedCart.map((item) => ({
              ...item,
              _id: item._id,
              productId: item.productId._id, // Save only product ID
            }))
          )
        );
      }
    } catch (error) {
      console.error('Error deleting item:', error.message);
    }
  };

  const mergeCart = async () => {
    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
  
    if (userId && localCart.length > 0) {
      try {
        const sanitizedCart = localCart.map(item => {
          const { _id, ...rest } = item;  // Remove the local _id field
          return rest;
        });
        const response = await axios.post('http://localhost:5000/api/cart/merge-cart', {
          userId,
          localCart: sanitizedCart,
        });
  
        console.log('Cart merged successfully:', response.data);
        // Clear local storage cart after merge
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Error merging cart:', error);
      }
    }
  };

  const handleCheckout = async () => {
    try {
      if (!storeOpen) return; // Prevent checkout when store is closed

      if (!userId) {
        navigate('/login', { state: { from: '/cart' } });
      } else {     
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length > 0) {
          await mergeCart(localCart);
          localStorage.removeItem('cart'); // Clear local storage cart after merge
        }
        const newTotalPrice = calculateTotal();
        updateTotalPriceInCart(newTotalPrice);
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Error updating total price in cart:', error.message);
    }
  };
  
  const updateTotalPriceInCart = async (newTotalPrice) => {
    try {
      await axios.get(`http://localhost:5000/api/cart/${userId}/updateTotalPrice`, {
        params: {
          newTotalPrice: newTotalPrice,
           tip: ((calculateSubtotal() * tipPercentage) / 100).toFixed(2),
        },
      });
      //await axios.get(`http://localhost:5000/api/cart/${userId}/updateTotalPrice/${newTotalPrice}`);
    } catch (error) {
      console.error('Error updating total price in cart:', error.message);
    }
  };

  return (
    
    <div className="cart-wrap">
    <div className="back-btn-wrap">
        <a href="/" className="back-btn">
          <i className="fa fa-chevron-left" aria-hidden="true"></i> 
        </a>
      </div>
      <div className="cart-container details-container">
        <h1>Cart</h1>
        {!storeOpen && (
          <div className="store-closed-message">
           <h1><p >⚠️ The store is currently closed. Orders cannot be placed.</p></h1> 
          </div>
        )}
        {cartItems.length === 0 ? (
          <>
            <i className="fa-solid fa-cart-shopping"></i>
            <p>Your cart is empty.</p>
          </>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <img
                  src={`http://localhost:5000${item.productId.image}`}
                  alt={item.productId.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.productId.name}</h3>
                  <p>Price: ${item.priceByQuantity}</p>
                  <div className="cart-item-quantity">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item._id,
                          parseInt(e.target.value, 10)
                        )
                      }
                    />
                  </div>
                  <p>Total: ${(item.priceByQuantity * item.quantity).toFixed(2)}</p>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteItem(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="cart-summary details-container">
              <h2>Order Summary</h2>
              <p>Subtotal: ${calculateSubtotal().toFixed(2)}</p>
              <p>HST (13%): ${calculateTax(calculateSubtotal()).toFixed(2)}</p>
              <div className="tip-selection form-group">
                <label htmlFor="tip">Tip:</label>
                <select
                  id="tip"
                  value={tipPercentage}
                  onChange={(e) => setTipPercentage(parseInt(e.target.value, 10))}
                >
                  <option value={0}>None</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                  <option value={20}>20%</option>
                  <option value={25}>25%</option>
                  <option value={50}>50%</option>
                </select>

              </div>
              <h3>Total: ${calculateTotal()}</h3>
              
              <button className="checkout-btn" onClick={handleCheckout} disabled={!storeOpen}>
                {storeOpen ? "Proceed to Checkout" : "Store Closed"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
