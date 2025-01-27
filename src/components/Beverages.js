import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Details.css';
import '../styles/Category.css';

const Beverages = () => {
  const [beverages, setBeverages] = useState([]);
  const navigate = useNavigate();
  const [selectedDrinks, setSelectedDrinks] = useState({}); // Store selected drink quantities as an object
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  useEffect(() => {
    const fetchBeverages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products?category=Beverages');
        setBeverages(response.data);
      } catch (error) {
        console.error('Error fetching beverages:', error);
      }
    };

    fetchBeverages();
  }, []);

  const handleDrinkSelection = (drinkName, quantity) => {
    setSelectedDrinks((prev) => ({
      ...prev,
      [drinkName]: quantity, // Update the quantity for the selected drink
    }));
  };

  
  const handleAddToCart = async () => {    
    try {
      // Prepare drinks array first
      const drinks = Object.entries(selectedDrinks)
        .filter(([_, quantity]) => quantity > 0) // Ensure only drinks with quantity > 0 are included
        .map(([name, quantity]) => ({
          name,
          quantity,
        }));
  
      // Calculate the total price of the beverages
      const totalPrice = calculateTotalPrice(drinks);
  
      const order = {  
        userId: userId || null,     
        productId: null, // Beverages may not have a specific productId
        drinks,
        totalPrice,
      };
  
      if (!userId) {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        localCart.push(order);
        localStorage.setItem('cart', JSON.stringify(localCart));
        alert('Item added to cart.');
        return;   
      }
  
      console.log('Order Payload:', order); // Debugging
      await axios.post('http://localhost:5000/api/cart',  { userId, ...order });
      alert('Beverages added to cart!');
    } catch (error) {
      console.error('Error adding beverages to cart:', error.message);
      alert('Failed to add beverages to cart.');
    }
  };
  


  const calculateTotalPrice = (drinks) => {
    return drinks.reduce((total, drink) => {
      const beverage = beverages.find((bev) => bev.name === drink.name);
      return total + (beverage.price * drink.quantity);
    }, 0).toFixed(2);
  };

  return (
<div>
    <div className="back-btn-wrap"><a href="/" className='back-btn'> <i class="fa fa-chevron-left" aria-hidden="true"></i> Back to Categories</a></div>
    <div className="details-container">
      <h1 className="details-title">Beverages</h1>
      <div className="grid-layout">
        {beverages.map((bev) => (
          <div key={bev._id} className="item-card">
            <img src={`http://localhost:5000${bev.image}`} alt={bev.name} className="category-card-image" />
            <h3 className="beverage-title">{bev.name}</h3>
            <p className="beverage-price">${bev.price.toFixed(2)}</p>
            <div className="beverage-quantity">
              <label htmlFor={`quantity-${bev.name}`}>Quantity:</label>
              <input
                id={`quantity-${bev.name}`}
                type="number"
                min="0"
                value={selectedDrinks[bev.name] || 0}
                onChange={(e) => handleDrinkSelection(bev.name, parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div></div>
  );
};

export default Beverages;
