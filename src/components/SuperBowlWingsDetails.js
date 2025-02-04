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

    fetchComboDetails();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const order = {
        userId: userId || null,
        productId: combo._id,
        wingsFlavor: selectedFlavor,
        side: selectedSide,
        quantity: 1, // Fixed quantity for the deal
        priceByQuantity: combo.price,
        totalPrice: combo.price,
      };

      if (!userId) {
        // Save to local storage if user is not logged in
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        localCart.push(order);
        localStorage.setItem('cart', JSON.stringify(localCart));
        alert('Item added to cart.');
        return;
      }

      console.log('Order payload:', order);
      await axios.post('http://localhost:5000/api/cart', order);
      alert('Super Bowl Wings Combo added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
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
          <div className="prod-img">
            <img
              src={`http://localhost:5000${combo.image}`}
              alt={combo.name}
              className="details-image"
            />
          </div>
          <div className="prod-details">
            <h1 className="details-title">{combo.name}</h1>
            <p className="details-price">Price: ${combo.price.toFixed(2)}</p>
          </div>
        </div>
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

          <button
            type="button"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperBowlWingsDetails;
