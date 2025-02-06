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
   const [cartItems, setCartItems] = useState([]);
  const userId = JSON.parse(localStorage.getItem('user'))?._id; // Retrieve the user ID from local storage

  useEffect(() => {
    const fetchWingDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setWing(response.data);
        // Initialize with the first available size and flavor
        setSelectedSize(response.data.details.sizes[0]);
        setSelectedFlavor(response.data.details.wingsFlavors[0]);
      } catch (error) {
        console.error('Error fetching wing details:', error);
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
    fetchCartItems(); 
    fetchWingDetails();
  }, [id]);

  // Calculate the total price based on the selected size adjustment and quantity.
  const calculateTotalPrice = () => {
    if (!wing) return 0;
    const basePrice = wing.price;
    // Get the additional cost for the selected size from wing.details.sizePrices
    const sizePriceAdjustment = wing.details.sizePrices[selectedSize] || 0;
    // The final price is (base price + size adjustment) multiplied by the quantity.
    return (basePrice + sizePriceAdjustment).toFixed(2) ;
  };

  const handleAddToCart = async () => {
    try {
      const order = {
        userId: userId || null,
        productId: wing._id,
        size: selectedSize,
        flavor: selectedFlavor,
        wingsFlavor: selectedFlavor,
        quantity,
        priceByQuantity: calculateTotalPrice(),
        totalPrice: (calculateTotalPrice()* quantity).toFixed(2),
        description: wing.description,
      };

      if (!userId) {
        // Save to local storage if the user is not logged in
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        localCart.push(order);
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCartItems(localCart);
        alert('Item added to cart.');
        return;
      }

      console.log('Order payload:', order);
      await axios.post('http://localhost:5000/api/cart', order);
      setCartItems((prev) => [...prev, order]); 
      alert('Wing order added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  const handleGoToCart = () => {
    navigate('/cart'); // Navigate to the cart page
  };
  if (!wing) return <div>Loading...</div>;

  return (
    <div>
      <div className="back-btn-wrap">
        <a href="/" className="back-btn">
          <i className="fa fa-chevron-left" aria-hidden="true"></i> Back to Categories
        </a>
      </div>
      <div className="details-container">
       
        <div className="product-container">
  {/* Image Section */}
  <div className="prod-img">
    <img 
      src={`http://localhost:5000${wing.image}`} 
      alt={wing.name} 
    />
  </div>

  {/* Details Section */}
  <div className="prod-details">
    <h1>{wing.name}</h1>
    <p className="details-price"> Price: ${(calculateTotalPrice()* quantity).toFixed(2)}</p>

    {/* Description Box */}
    <div className="description-box">
      <h3>📌 What's Included?</h3>
      <p>{wing.description}</p>
    </div>
  </div>
</div>
        <div className="form-container">
        <form className="details-form">
          <div className="form-wrap">
            <div className="form-group">
              <label htmlFor="size">Choose Size:</label>
              <select
                id="size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {wing.details.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size} {wing.details.sizePrices[size] > 0 ? `(+$${wing.details.sizePrices[size].toFixed(2)})` : ''}
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
                {wing.details.wingsFlavors.map((flavor) => (
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

export default WingsDetails;
