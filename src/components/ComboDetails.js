import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/Details.css';

const ComboDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const [combo, setCombo] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]); // Updated to be populated on data fetch
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchComboDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setCombo(response.data);

        setSelectedSize(response.data.details.sizes[0]);
        setSelectedFlavor(response.data.details.wingsFlavors[0]);
        setSelectedSide(response.data.details.sides[0]);
        // Initialize drinks if provided in the backend
        if (response.data.details.drinks && response.data.details.drinks.length > 0) {
          setSelectedDrinks([]);

        }
      } catch (error) {
        console.error('Error fetching combo details:', error);
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

    const fetchDrinks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products/beverages');
        setCombo((prevCombo) => ({
          ...prevCombo,
          details: {
            ...prevCombo.details,
            drinks: response.data.map((drink) => drink.name),
            
          },
        }));
      } catch (error) {
        console.error('Error fetching drinks:', error);
      }
    };
    fetchComboDetails();
    fetchToppings();
    fetchDrinks();
  }, [id]);

 
  

  const calculateTotalPrice = () => {
    if (!combo) return 0;

    const sizePriceAdjustment = combo.details.sizePrices[selectedSize] || 0;
    const extraToppingsPrice = Math.max(0, selectedToppings.length - combo.details.toppingsPerPizza) * combo.details.extraToppingPrice;

    return ((combo.price + sizePriceAdjustment + extraToppingsPrice) * quantity).toFixed(2);
  };

  const handleToppingSelection = (topping) => {
    setSelectedToppings((prev) => {
      if (prev.includes(topping)) {
        return prev.filter((t) => t !== topping);
      } else {
        return [...prev, topping];
      }
    });
  };

 
  const handleDrinkSelection = (drinkName) => {
    setSelectedDrinks((prevDrinks) => {
      if (prevDrinks.includes(drinkName)) {
        return prevDrinks.filter(drink => drink !== drinkName);
      } else if (prevDrinks.length < 2) {
        return [...prevDrinks, drinkName];
      }
      return prevDrinks; // Prevent adding more than maxDrinksAllowed
    });
  };
  

  const handleAddToCart = async () => {
    try {
      const order = {
        productId: combo._id,
        size: selectedSize,
        wingsFlavor: selectedFlavor,
        sides: [selectedSide],
        drinks: selectedDrinks,
        toppings: selectedToppings,
        quantity,
        totalPrice: calculateTotalPrice(),
      };

      await axios.post('http://localhost:5000/api/orders', order);
      alert('Combo added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  if (!combo) return <div className="loading">Loading combo details...</div>;

  return (
    <div className="details-container">
      <img src={`http://localhost:5000${combo.image}`} alt={combo.name} className="details-image" />
      <h1 className="details-title">{combo.name}</h1>
      <p className="details-price">Base Price: ${combo.price.toFixed(2)}</p>

      <form className="details-form">
        <div className="form-group">
          <label htmlFor="size">Choose Size:</label>
          <select id="size" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
            {combo.details.sizes.map((size) => (
              <option key={size} value={size}>
                {size} (Additional: ${combo.details.sizePrices[size].toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="flavor">Choose Wings Flavor:</label>
          <select id="flavor" value={selectedFlavor} onChange={(e) => setSelectedFlavor(e.target.value)}>
            {combo.details.wingsFlavors.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavor}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="side">Choose Side:</label>
          <select id="side" value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
            {combo.details.sides.map((side) => (
              <option key={side} value={side}>
                {side}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="drinks">Choose Drinks:</label>
          <div id="drinks">
            {combo.details.drinks.map((drink) => (
              <div key={drink}>
                <input
                  type="checkbox"
                  value={drink}
                  checked={selectedDrinks.includes(drink)}
                  onChange={() => handleDrinkSelection(drink)}
                />
                {drink}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="toppings">Choose Toppings:</label>
          <div id="toppings">
            {toppings.map((topping) => (
              <div key={topping.name}>
                <input
                  type="checkbox"
                  value={topping.name}
                  checked={selectedToppings.includes(topping.name)}
                  onChange={() => handleToppingSelection(topping.name)}
                />
                {topping.name}
              </div>
            ))}
          </div>
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

        <button type="button" className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </form>
    </div>
  );
};

export default ComboDetails;
