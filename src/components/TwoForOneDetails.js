import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Details.css';

const TwoForOneDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const [deal, setDeal] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([[], []]); // Toppings for each pizza
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  useEffect(() => {
    const fetchDealDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setDeal(response.data);
        setSelectedSize(response.data.details.sizes[0]);
      } catch (error) {
        console.error('Error fetching deal details:', error);
      }
    };

    const fetchToppings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/toppings');
        setToppings(response.data);
      } catch (error) {
        console.error('Error fetching toppings:', error);
      }
    };

    fetchDealDetails();
    fetchToppings();
  }, [id]);

  const calculateTotalPrice = () => {
    if (!deal) return 0;

    const sizePriceAdjustment = deal.details.sizePrices[selectedSize] || 0;

    const extraToppingsPrice = selectedToppings.reduce((total, pizzaToppings) => {
      return (
        total +
        Math.max(0, pizzaToppings.length - deal.details.toppingsPerPizza) * deal.details.extraToppingPrice
      );
    }, 0);

    return ((deal.price + sizePriceAdjustment + extraToppingsPrice) * quantity).toFixed(2);
  };

  const handleToppingSelection = (pizzaIndex, topping) => {
    setSelectedToppings((prev) => {
      const updatedToppings = [...prev];
      if (updatedToppings[pizzaIndex].includes(topping)) {
        updatedToppings[pizzaIndex] = updatedToppings[pizzaIndex].filter((t) => t !== topping);
      } else {
        updatedToppings[pizzaIndex] = [...updatedToppings[pizzaIndex], topping];
      }
      return updatedToppings;
    });
  };

  const handleAddToCart = async () => {
    if (!userId) {
      alert('You need to log in to add items to your cart.');
      navigate('/login');
      return;
    }
    try {
      const order = {
        userId, 
        productId: deal._id,
        size: selectedSize,
        toppings: selectedToppings,
        quantity,
        totalPrice: calculateTotalPrice(),
      };

      await axios.post('http://localhost:5000/api/orders', order);
      alert('Two-for-One Deal added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  if (!deal) return <div className="loading">Loading deal details...</div>;

  return (
    <div className="details-container">
      <img src={`http://localhost:5000${deal.image}`} alt={deal.name} className="details-image" />
      <h1 className="details-title">{deal.name}</h1>
      <p className="details-price">Base Price: ${deal.price.toFixed(2)}</p>

      <form className="details-form">
        <div className="form-group">
          <label htmlFor="size">Choose Size:</label>
          <select id="size" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
            {deal.details.sizes.map((size) => (
              <option key={size} value={size}>
                {size} (Additional: ${deal.details.sizePrices[size].toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {Array.from({ length: 2 }).map((_, pizzaIndex) => (
          <div key={pizzaIndex} className="form-group">
            <label>Toppings for Pizza {pizzaIndex + 1} (Min {deal.details.toppingsPerPizza}):</label>
            <div>
              {toppings.map((topping) => (
                <div key={topping.name}>
                  <input
                    type="checkbox"
                    value={topping.name}
                    checked={selectedToppings[pizzaIndex]?.includes(topping.name) || false}
                    onChange={() => handleToppingSelection(pizzaIndex, topping.name)}
                  />
                  {topping.name}
                </div>
              ))}
            </div>
          </div>
        ))}

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

        <button type="button" className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </form>
    </div>
  );
};

export default TwoForOneDetails;