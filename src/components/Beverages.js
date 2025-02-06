import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Details.css';
import '../styles/Category.css';

const Beverages = () => {
  const [beverages, setBeverages] = useState([]);
  const navigate = useNavigate();
  // This state stores the quantity for each beverage keyed by its name.
  const [selectedDrinks, setSelectedDrinks] = useState({});
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchBeverages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products?category=Beverages`);
        setBeverages(response.data);
      } catch (error) {
        console.error('Error fetching beverages:', error);
      }
    };

    fetchBeverages();
  }, []);

  // Update the quantity for a specific beverage.
  const handleDrinkSelection = (drinkName, quantity) => {
    setSelectedDrinks((prev) => ({
      ...prev,
      [drinkName]: quantity,
    }));
  };

  // Handles adding an individual beverage to the cart.
  // If the beverage already exists in the cart, its quantity will be increased.
  const handleIndividualAddToCart = async (bev) => {
    const quantity = selectedDrinks[bev.name] ?? 1;
    if (quantity <= 0) {
      alert("Please select a quantity greater than 0.");
      return;
    }
    try {
      // Guest users: update cart in localStorage.
      if (!userId) {
        let localCart = JSON.parse(localStorage.getItem('cart')) || [];
        // Check if the beverage is already in the cart (using its productId)
        const existingIndex = localCart.findIndex(item => item.productId === bev._id);
        if (existingIndex !== -1) {
          // Increase quantity
          localCart[existingIndex].quantity += quantity;
          // Update total price (assuming the price per unit remains constant)
          localCart[existingIndex].totalPrice = (bev.price * localCart[existingIndex].quantity).toFixed(2);
        } else {
          // Add new beverage item to cart.
          const order = {
            userId: null,
            productId: bev._id,
            name: bev.name,
            quantity,
            priceByQuantity :bev.price,
            totalPrice: (bev.price * quantity).toFixed(2),
          };
          localCart.push(order);
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
        alert('Item added to cart.');
        return;
      }

      // Logged in users: assume the backend will handle merging the same product.
      // Alternatively, you could retrieve the user's cart and update it accordingly.
      const order = {
        userId,
        productId: bev._id,
        name: bev.name,
        quantity,
        priceByQuantity: bev.price,
        totalPrice: (bev.price * quantity).toFixed(2),
      };

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/cart`, order);
      alert('Beverage added to cart!');
    } catch (error) {
      console.error('Error adding beverage to cart:', error.message);
      alert('Failed to add beverage to cart.');
    }
  };

  return (
    <div>
      <div className="back-btn-wrap">
        <a href="/" className="back-btn">
          <i className="fa fa-chevron-left" aria-hidden="true"></i> Back to Categories
        </a>
      </div>
      <div className="details-container beverages">
        <h1 className="details-title">Beverages</h1>
        <div className="grid-layout">
          {beverages.map((bev) => (
            <div key={bev._id} className="item-card">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}${bev.image}`}
                alt={bev.name}
                className="category-card-image"
              />
              <h3 className="beverage-title">{bev.name}</h3>
              <p className="beverage-price">${bev.price.toFixed(2)}</p>
              <div className="beverage-quantity">
                <label htmlFor={`quantity-${bev.name}`}>Quantity:</label>
                <input
                  id={`quantity-${bev.name}`}
                  type="number"
                  min="1"
                  value={selectedDrinks[bev.name] ?? 1}
                  onChange={(e) =>
                    handleDrinkSelection(bev.name, parseInt(e.target.value, 10))
                  }
                />
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => handleIndividualAddToCart(bev)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Beverages;
