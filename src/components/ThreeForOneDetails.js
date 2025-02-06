import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Details.css';

const ThreeForOneDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const [deal, setDeal] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([[], [],[]]); // Toppings for each pizza
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
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

    fetchDealDetails();
    fetchToppings();
    fetchCartItems(); 
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

    return (deal.price + sizePriceAdjustment + extraToppingsPrice).toFixed(2);
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
   
    try {
      const order = {
        userId: userId || null,
        productId: deal._id,
        size: selectedSize,
        toppings: selectedToppings,
        quantity,
        priceByQuantity: calculateTotalPrice(),
        totalPrice: (calculateTotalPrice()* quantity).toFixed(2),
        description: deal.description,
      };
      if (!userId) {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        localCart.push(order);
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCartItems(localCart); 
        alert('Item added to cart.');
        return;   
      }
      await axios.post('http://localhost:5000/api/cart',  { userId, ...order });
      setCartItems((prev) => [...prev, order]); 
      alert('Two-for-One Deal added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };
  const handleGoToCart = () => {
    navigate('/cart'); // Navigate to the cart page
  };
  if (!deal) return <div className="loading">Loading deal details...</div>;

  return (


<div>
    <div className="back-btn-wrap"><a href="/" className='back-btn'> <i class="fa fa-chevron-left" aria-hidden="true"></i> Back to Categories</a></div>
  <div className="details-container">
  <div className="product-container">
  {/* Image Section */}
  <div className="prod-img">
    <img 
      src={`http://localhost:5000${deal.image}`} 
      alt={deal.name} 
    />
  </div>

  {/* Details Section */}
  <div className="prod-details">
    <h1>{deal.name}</h1>
    <p className="details-price"> Price: ${(calculateTotalPrice()* quantity).toFixed(2)}</p>

    {/* Description Box */}
    <div className="description-box">
      <h3>📌 What's Included?</h3>
      <p>{deal.description}</p>
    </div>
  </div>
</div>
 
    <div className="form-container">
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

        {Array.from({ length: 3 }).map((_, pizzaIndex) => (
          <div key={pizzaIndex} className="form-group">
            <label>Toppings for Pizza {pizzaIndex + 1} (Min {deal.details.toppingsPerPizza}):</label>
            <div>
              {toppings.map((topping) => (
                <label key={topping.name}>
                  <input
                    type="checkbox"
                    value={topping.name}
                    checked={selectedToppings[pizzaIndex]?.includes(topping.name) || false}
                    onChange={() => handleToppingSelection(pizzaIndex, topping.name)}
                  />
                  {topping.name}
                </label>
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

export default ThreeForOneDetails;