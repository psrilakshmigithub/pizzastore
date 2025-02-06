import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Details.css';

const SuperBowlWingsDetails = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
   const [cartItems, setCartItems] = useState([]); 
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchComboDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setCombo(response.data);
        // Set default selections
        setSelectedFlavor(response.data.details.wingsFlavors[0]);
        setSelectedSide(response.data.details.sides[0]);
      } catch (error) {
        console.error('Error fetching combo details:', error);
      }
    };
    const fetchCartItems = async () => {
      if (userId) {
        // Fetch cart items from the backend for logged-in users
        try {
          const response = await axios.get(`http://localhost:5000/api/cart?userId=${userId}`);
          setCartItems(response.data);
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      } else {
        // Fetch cart items from localStorage for non-logged-in users
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(localCart);
      }
    };
    fetchCartItems(); 

    fetchComboDetails();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const order = {
        userId: userId || null,
        productId: combo._id,
        wingsFlavor: selectedFlavor,
        sides: [selectedSide],
        quantity: 1, // Fixed quantity for the deal
        priceByQuantity: combo.price,
        totalPrice: combo.price,
        description: combo.description
      };

      if (!userId) {
        // Save to local storage if user is not logged in
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        localCart.push(order);
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCartItems(localCart); 
        alert('Item added to cart.');
        return;
      }

      console.log('Order payload:', order);
      await axios.post('http://localhost:5000/api/cart', order);
      setCartItems((prev) => [...prev, order]); 
      alert('Super Bowl Wings Combo added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  const handleGoToCart = () => {
    navigate('/cart'); // Navigate to the cart page
  };
  if (!combo) return <div>Loading...</div>;

  return (
    <div>
      <div className="back-btn-wrap">
        <a href="/" className="back-btn">
          <i className="fa fa-chevron-left" aria-hidden="true"></i> Back to Categories
        </a>
      </div>
      <div className="details-container">
      <div className="product-container">
      {/* Image Section */}
  <div className="prod-img">
    <img 
      src={`http://localhost:5000${combo.image}`} 
      alt={combo.name} 
    />
  </div>

  {/* Details Section */}
  <div className="prod-details">
    <h1>{combo.name}</h1>
    <p className="details-price"> Price: ${combo.price.toFixed(2)}</p>

    {/* Description Box */}
    <div className="description-box">
      <h3>📌 What's Included?</h3>
      <p>{combo.description}</p>
    </div>
</div>
</div>
<div className="form-container">
        <form className="details-form">
          <div className="form-wrap">
            <div className="form-group">
              <label htmlFor="flavor">Choose Flavor:</label>
              <select
                id="flavor"
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
              >
                {combo.details.wingsFlavors.map((flavor) => (
                  <option key={flavor} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="side">Choose a Side:</label>
              <select
                id="side"
                value={selectedSide}
                onChange={(e) => setSelectedSide(e.target.value)}
              >
                {combo.details.sides.map((side) => (
                  <option key={side} value={side}>
                    {side}
                  </option>
                ))}
              </select>
            </div>
            
          </div>

          <p className="details-total">Total Price: ${combo.price.toFixed(2)}</p>

          <button className="add-to-cart-btn" type="button" onClick={handleAddToCart}>
              Add to Cart
            </button>
            {cartItems.length > 0 && ( // Show "Go to Cart" button if there are items in the cart
              <button className="go-to-cart-btn" type="button" onClick={handleGoToCart}>
                Go to Cart
              </button>
            )}
        </form>
        </div>
      </div>
    </div>
  );
};

export default SuperBowlWingsDetails;
