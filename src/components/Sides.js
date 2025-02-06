import React, { useState, useEffect,useParams  } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Details.css';
import '../styles/Category.css';

const Sides = () => {
  
  const [sides, setSides] = useState([]);
  const navigate = useNavigate();
  // This state stores the quantity for each side keyed by its name.
  const [selectedSides, setSelectedSides] = useState({});
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchSides = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products?category=Sides`);
        setSides(response.data);
      } catch (error) {
        console.error('Error fetching sides:', error);
      }
    };

    fetchSides();
  }, []);

  // Update the quantity for a specific side product.
  const handleSideSelection = (sideName, quantity) => {
    setSelectedSides((prev) => ({
      ...prev,
      [sideName]: quantity,
    }));
  };

  // Handles adding an individual side product to the cart.
  // If the product already exists in the cart, its quantity will be increased.
  const handleIndividualAddToCart = async (side) => {
    const quantity = selectedSides[side.name] ?? 1;
    if (quantity <= 0) {
      alert("Please select a quantity greater than 0.");
      return;
    }
    try {
      // Guest user: update cart stored in localStorage.
      if (!userId) {
        let localCart = JSON.parse(localStorage.getItem('cart')) || [];
        // Check if the side is already in the cart (using its productId)
        const existingIndex = localCart.findIndex(item => item.productId === side._id);
        if (existingIndex !== -1) {
          // Increase the quantity and update the total price.
          localCart[existingIndex].quantity += quantity;
          localCart[existingIndex].totalPrice = (side.price * localCart[existingIndex].quantity).toFixed(2);
        } else {
          // Add new side product to cart.
          const order = {
            userId: null,
            productId: side._id,
            name: side.name,
            quantity,            
            priceByQuantity: side.price.toFixed(2),
            totalPrice: (side.price * quantity).toFixed(2),
          };
          localCart.push(order);
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
        alert('Item added to cart.');
        return;
      }

      // Logged-in users: send the order to the API.
      const order = {
        userId,
        productId: side._id,
        name: side.name,
        quantity,
        priceByQuantity: side.price.toFixed(2),
        totalPrice: (side.price * quantity).toFixed(2),
      };

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/cart`, order);
      alert('Side added to cart!');
    } catch (error) {
      console.error('Error adding side to cart:', error.message);
      alert('Failed to add side to cart.');
    }
  };

  return (
    <div>
      <div className="back-btn-wrap">
        <a href="/" className="back-btn">
          <i className="fa fa-chevron-left" aria-hidden="true"></i> Back to Categories
        </a>
      </div>
      <div className="details-container beverage">
        <h1 className="details-title">Sides</h1>
        <div className="grid-layout">
          {sides.map((side) => (
            <div key={side._id} className="item-card">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}${side.image}`}
                alt={side.name}
                className="category-card-image"
              />
              <h3 className="beverage-title">{side.name}</h3>
              <p className="beverage-price">${side.price.toFixed(2)}</p>
             
              <div className="beverage-quantity">
                <label htmlFor={`quantity-${side.name}`}>Quantity:</label>
                <input
                  id={`quantity-${side.name}`}
                  type="number"
                  min="1"
                  value={selectedSides[side.name] ?? 1}
                  onChange={(e) =>
                    handleSideSelection(side.name, parseInt(e.target.value, 10))
                  }
                />
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => handleIndividualAddToCart(side)}
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

export default Sides;
