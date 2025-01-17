import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Details.css';

const WingsDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const [wing, setWing] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const userId = JSON.parse(localStorage.getItem('user'))?._id; // Retrieve the user ID from local storage

  useEffect(() => {
    const fetchWingDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setWing(response.data);
        setSelectedSize(response.data.details.sizes[0]);
        setSelectedFlavor(response.data.details.Flavors[0]);
      } catch (error) {
        console.error('Error fetching wing details:', error);
      }
    };

    fetchWingDetails();
  }, [id]);

  const calculateTotalPrice = () => {
    if (!wing) return 0;
    return (wing.price * quantity).toFixed(2);
  };

  const handleAddToCart = async () => {
    if (!userId) {
      alert('You need to log in to add items to your cart.');
      navigate('/login');
      return;
    }

    try {
      const order = {
        userId, // Add the user ID to the payload
        productId: wing._id,
        size: selectedSize,
        flavor: selectedFlavor,
        quantity,
        totalPrice: calculateTotalPrice(),
      };

      console.log('Order payload:', order);

      await axios.post('http://localhost:5000/api/orders', order);
      alert('Wing order added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  if (!wing) return <div>Loading...</div>;

  return (
    <div className="details-container">
      <img
        src={`http://localhost:5000${wing.image}`}
        alt={wing.name}
        className="details-image"
      />
      <h1 className="details-title">{wing.name}</h1>
      <p className="details-price">Price: ${wing.price.toFixed(2)}</p>

      <form className="details-form">
        <div className="form-group">
          <label htmlFor="size">Choose Size:</label>
          <select
            id="size"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            {wing.details.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="flavor">Choose Flavor:</label>
          <select
            id="flavor"
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
          >
            {wing.details.Flavors.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavor}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          />
        </div>

        <p className="details-total">Total Price: ${calculateTotalPrice()}</p>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </form>
    </div>
  );
};

export default WingsDetails;
