import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Details.css';

const PanzerotteDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const [panzerotte, setPanzerotte] = useState(null);
  const navigate = useNavigate();
  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  useEffect(() => {
    const fetchPanzerotteDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setPanzerotte(response.data);
        setSelectedFlavor(response.data.details.Flavors[0]);
      } catch (error) {
        console.error('Error fetching panzerotte details:', error);
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

    fetchPanzerotteDetails();
    fetchToppings();
  }, [id]);

  const calculateTotalPrice = () => {
    if (!panzerotte) return 0;

    const extraToppingsPrice = Math.max(0, selectedToppings.length - panzerotte.details.toppingsPerPizza) * panzerotte.details.extraToppingPrice;

    return ((panzerotte.price + extraToppingsPrice) * quantity).toFixed(2);
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

  const handleAddToCart = async () => {
   
    try {
      const order = {   
        userId: userId || null,     
        productId: panzerotte._id,
        flavor: selectedFlavor,
        toppings: selectedToppings,
        quantity,
        totalPrice: calculateTotalPrice(),
      };
      if (!userId) {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          localCart.push(order);
          localStorage.setItem('cart', JSON.stringify(localCart));
          alert('Item added to cart.');
          return;   
      }
      await axios.post('http://localhost:5000/api/cart',  order );
      alert('Panzerotte added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  if (!panzerotte) return <div className="loading">Loading panzerotte details...</div>;

  return (
  
<div>
    <div className="back-btn-wrap"><a href="/" className='back-btn'> <i class="fa fa-chevron-left" aria-hidden="true"></i> Back to Categories</a></div>
  <div className="details-container">
    <div className="product-container">
    <div className="prod-img">
    <img src={`http://localhost:5000${panzerotte.image}`} alt={panzerotte.name} className="details-image" />
    </div>
    <div className="prod-details">
    <h1 className="details-title">{panzerotte.name}</h1>
    <p className="details-price">Base Price: ${panzerotte.price.toFixed(2)}</p>
    </div>
    </div>
    
    <form className="details-form">
        <div className="form-group">
          <label htmlFor="flavor">Choose Flavor:</label>
          <select id="flavor" value={selectedFlavor} onChange={(e) => setSelectedFlavor(e.target.value)}>
            {panzerotte.details.Flavors.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavor}
              </option>
            ))}
          </select>
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
  </div>




  );
};

export default PanzerotteDetails;
