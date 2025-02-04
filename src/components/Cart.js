import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css'; // Ensure the CSS file exists

const Cart = () => {
  const [cartItems, setCartItems] = useState([]); // Initialize as an array
  const [tipPercentage, setTipPercentage] = useState(0);
  const [taxRate] = useState(0.13); // Example: 13% tax
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchCartItems = async () => {
      console.log("userId",userId);
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (!userId || localCart.length > 0) {
                console.log("not userId");        
        const populatedCart = await fetchProductDetails(localCart);
        setCartItems(
          Array.isArray(populatedCart) ? populatedCart.map((item) => ({
            ...item,
            totalPrice: (item.productId.price || 0) * item.quantity, // Ensure totalPrice exists
          })) : []
        );
      } else {
        try {
          console.log("else userId");         
          const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
          console.log("response user id",response.data);
          setCartItems(Array.isArray(response.data.items) ? response.data.items : []); // Ensure an array is set
       
          console.log("response.data.items",cartItems);
        } catch (error) {
          console.error('Error fetching cart:', error.message);
        }
      }
    };

    fetchCartItems();
  }, [userId]);

  const calculateSubtotal = () =>
    cartItems.reduce((total, item) => total + (item.totalPrice * item.quantity || 0), 0);

  const calculateTax = (subtotal) => subtotal * taxRate;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const tip = (subtotal * tipPercentage) / 100;
    return (subtotal + tax + tip).toFixed(2);
  };


  const fetchProductDetails = async (cart) => {
    const updatedCart = await Promise.all(
      cart.map(async (item) => {
        try {
          const response = await axios.get(`http://localhost:5000/api/products/${item.productId}`);
          return {
            ...item,
            productId: response.data, // Populate product details
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error.message);
          return null; // Return null for failed items
        }
      })
    );
    const filteredCart = updatedCart.filter((item) => item !== null); // Exclude failed items
    localStorage.setItem(
      'cart',
      JSON.stringify(
        filteredCart.map((item) => ({
          ...item,
          productId: item.productId._id, // Store only product ID
        }))
      )
    );
    return filteredCart;
  };

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (userId && !localCart.length>0 ) {
        console.log("user with qunatity chnage");
        const response = await axios.put(`http://localhost:5000/api/cart/${userId}/${itemId}`, { quantity });
        console.log("response.data.items",response.data);
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } else {
        
        const updatedCart = cartItems.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        );
        
        console.log("itemId",itemId);
        console.log("updatedCart",updatedCart);
        setCartItems(updatedCart);
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updatedCart.map((item) => ({
              ...item,
              productId: item.productId._id, // Store only product ID
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
      if (userId && !localCart.length>0 ) {
        const response = await axios.delete(`http://localhost:5000/api/cart/${userId}/${itemId}`);
        console.log("response.data.items",response.data);
        setCartItems(Array.isArray(response.data) ? response.data : []);
    
      } else {
        const updatedCart = cartItems.filter((item) => item._id !== itemId);
        setCartItems(updatedCart);
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updatedCart.map((item) => ({
              ...item,
              productId: item.productId._id, // Store only product ID
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
        const response = await axios.post('http://localhost:5000/api/cart/merge-cart', {
          userId,
          localCart,
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
        if (!userId) {
              navigate('/login', { state: { from: '/cart' } });
      } else {     
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          console.log("localCart.length",localCart.length);
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
      console.log("updateTotalPriceInCart",updateTotalPriceInCart);
      await axios.get(`http://localhost:5000/api/cart/${userId}/updateTotalPrice/${newTotalPrice}`);
    } catch (error) {
      console.error('Error updating total price in cart:', error.message);
    }
  };

  return (
    <div className="cart-wrap"><div className="cart-container details-container">
      <h1>Cart</h1>
      {cartItems.length === 0 ? (
        <><i class="fa-solid fa-cart-shopping"></i><p>Your cart is empty.</p></>
        
      ) : (
        <>
          {cartItems.map((item) => (
            <div className="''"><div key={item._id} className="cart-item">
              <img
                src={`http://localhost:5000${item.productId.image}`}
                alt={item.productId.name}
                className="cart-item-image"
              />
              
              <div className="cart-item-details">
                <h3>{item.productId.name}</h3>
                <p>Price: ${item.productId.price.toFixed(2)}</p>
                <div className="cart-item-quantity">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item._id, parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <p>Total: ${(item.quantity * item.totalPrice).toFixed(2)}</p>
                <button className="delete-btn" onClick={() => handleDeleteItem(item._id)}> Remove </button>
              </div>
              
            </div></div>
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
            <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          </div>

          
        </>
      )}
    </div>
    
    </div>
  );
};

export default Cart;
