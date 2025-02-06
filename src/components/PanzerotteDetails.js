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
   const [cartItems, setCartItems] = useState([]); // State to track cart items
  
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  useEffect(() => {
    const fetchPanzerotteDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/${id}`);
        setPanzerotte(response.data);
        setSelectedFlavor(response.data.details.Flavors[0]);
      } catch (error) {
        console.error('Error fetching panzerotte details:', error);
      }
    };

    const fetchToppings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/toppings`);
        setToppings(response.data);
      } catch (error) {
        console.error('Error fetching toppings:', error);
      }
    };
    const fetchCartItems = async () => {
      if (userId) {
        // Fetch cart items from the backend for logged-in users
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/cart?userId=${userId}`);
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
    fetchPanzerotteDetails();
    fetchToppings();
  }, [id]);

  const calculateTotalPrice = () => {
    if (!panzerotte) return 0;

    const extraToppingsPrice = Math.max(0, selectedToppings.length - panzerotte.details.toppingsPerPizza) * panzerotte.details.extraToppingPrice;

    return (panzerotte.price + extraToppingsPrice).toFixed(2);
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

  const handleGoToCart = () => {
    navigate('/cart'); // Navigate to the cart page
  };

  const handleAddToCart = async () => {
   
    try {
      const order = {   
        userId: userId || null,     
        productId: panzerotte._id,
        flavor: selectedFlavor,
        toppings: selectedToppings,
        quantity,
        priceByQuantity: calculateTotalPrice(),
        totalPrice: (calculateTotalPrice()* quantity).toFixed(2),
      };
      if (!userId) {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          localCart.push(order);
          localStorage.setItem('cart', JSON.stringify(localCart));
          setCartItems(localCart);
          alert('Item added to cart.');
          return;   
      }
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/cart`,  order );
      setCartItems((prev) => [...prev, order]); 
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
  {/* Image Section */}
  <div className="prod-img">
    <img 
      src={`${process.env.REACT_APP_API_BASE_URL}${panzerotte.image}`} 
      alt={panzerotte.name} 
    />
  </div>

  {/* Details Section */}
  <div className="prod-details">
    <h1>{panzerotte.name}</h1>
    <p className="details-price"> Price: ${(calculateTotalPrice()* quantity).toFixed(2)}</p>

    {/* Description Box */}
    <div className="description-box">
      <h3>📌 What's Included?</h3>
      <p>{panzerotte.description}</p>
    </div>
  </div>
</div>
    <div className="form-container">
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
              <label key={topping.name}>
                <input
                  type="checkbox"
                  value={topping.name}
                  checked={selectedToppings.includes(topping.name)}
                  onChange={() => handleToppingSelection(topping.name)}
                />
                {topping.name}
              </label>
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

        <p className="details-total">Total Price: ${(calculateTotalPrice()* quantity).toFixed(2)}</p>

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

export default PanzerotteDetails;
