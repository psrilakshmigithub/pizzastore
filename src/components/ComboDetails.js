import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Details.css';

const ComboDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState({
    price: 0,
    details: { sizes: [], wingsFlavors: [], sides: [], drinks: [], sizePrices: {}, sizeDescriptions: {} },
  });
  const [toppings, setToppings] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeDescription, setSizeDescription] = useState('');
  const [cartItems, setCartItems] = useState([]); // State to track cart items
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    const fetchComboDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/${id}`);
        setCombo(response.data);
        setSelectedSize(response.data.details.sizes[0]);
        setSelectedFlavor(response.data.details.wingsFlavors[0]);
        setSelectedSide(response.data.details.sides[0]);
        setSizeDescription(response.data.details.sizeDescriptions[response.data.details.sizes[0]]);

        if (response.data.details.drinks && response.data.details.drinks.length > 0) {
          setSelectedDrinks([]);
        }
      } catch (error) {
        console.error('Error fetching combo details:', error);
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

    const fetchDrinks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/beverages`);
        setCombo((prevCombo) => {
          if (!prevCombo) return null;
          return {
            ...prevCombo,
            details: {
              ...prevCombo.details,
              drinks: response.data.map((drink) => drink.name),
            },
          };
        });
      } catch (error) {
        console.error('Error fetching drinks:', error);
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

    fetchComboDetails();
    fetchToppings();
    fetchDrinks();
    fetchCartItems(); // Fetch cart items when the component mounts
  }, [id, userId]);

  const calculateTotalPrice = () => {
    if (!combo || !combo.details) return '0.00';

    const basePrice = combo?.price ?? 0;
    const sizePriceAdjustment = combo.details.sizePrices?.[selectedSize] ?? 0;
    const extraToppingsPrice =
      Math.max(0, selectedToppings.length - combo.details.toppingsPerPizza) * combo.details.extraToppingPrice;

    return (basePrice + sizePriceAdjustment + extraToppingsPrice).toFixed(2);
  };

  const handleToppingSelection = (topping) => {
    setSelectedToppings((prev) =>
      prev.includes(topping) ? prev.filter((t) => t !== topping) : [...prev, topping]
    );
  };

  const handleDrinkSelection = (drink) => {
    const maxDrinks = selectedSize === 'Small' ? 2 : selectedSize === 'Medium' ? 3 : 4;

    setSelectedDrinks((prev) => {
      if (prev.includes(drink)) {
        return prev.filter((d) => d !== drink);
      } else {
        if (prev.length < maxDrinks) {
          return [...prev, drink];
        } else {
          alert(`You can select a maximum of ${maxDrinks} drinks for a ${selectedSize} size.`);
          return prev;
        }
      }
    });
  };

  const handleSizeChange = (event) => {
    const newSize = event.target.value;
    setSelectedSize(newSize);
    setSizeDescription(combo.details.sizeDescriptions[newSize]);
  };

  const handleAddToCart = async () => {
    try {
      const order = {
        userId: userId || null,
        productId: combo._id,
        size: selectedSize,
        wingsFlavor: selectedFlavor,
        sides: [selectedSide],
        drinks: selectedDrinks.map((drink) => ({ name: drink, quantity: 1 })),
        toppings: selectedToppings,
        quantity,
        priceByQuantity: calculateTotalPrice(),
        totalPrice: (calculateTotalPrice() * quantity).toFixed(2),
        description: sizeDescription,
      };

      if (!userId) {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        localCart.push(order);
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCartItems(localCart); // Update cart items state
        alert('Item added to cart.');
        return;
      }

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/cart`, order);
      setCartItems((prev) => [...prev, order]); // Update cart items state
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error.message);
      alert('Failed to add item to cart.');
    }
  };

  const handleGoToCart = () => {
    navigate('/cart'); // Navigate to the cart page
  };

  if (!combo) return <div>Loading...</div>;

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
            <img src={`${process.env.REACT_APP_API_BASE_URL}${combo.image}`} alt={combo.name} />
          </div>

          {/* Details Section */}
          <div className="prod-details">
            <h1>{combo.name}</h1>
            <p className="details-price"> Price: ${(calculateTotalPrice() * quantity).toFixed(2)}</p>

            {/* Description Box */}
            <div className="description-box">
              <h3>📌 What's Included?</h3>
              <p>{sizeDescription}</p>
            </div>
          </div>
        </div>
        <div className="form-container">
          <form className="details-form">
            <div className="form-wrap">
            <div className="form-group">
          <label htmlFor="size">Choose Size:</label>
          <select id="size" value={selectedSize} onChange={handleSizeChange}>
            {combo.details.sizes.map((size) => (           
              <option key={size} value={size}>
                    {size} (Additional: ${combo.details.sizePrices[size].toFixed(2)})
                  </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="flavor">Choose Wings Flavor:</label>
          <select id="flavor"  value={selectedFlavor} onChange={(e) => setSelectedFlavor(e.target.value)}>
            {combo.details.wingsFlavors.map((flavor) => (
              <option key={flavor} value={flavor}>{flavor}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="side">Choose Side:</label>
          <select id="side" value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
            {combo.details.sides.map((side) => (
              <option key={side} value={side}>{side}</option>
            ))}
          </select>
        </div>
        </div>

        <div className="form-group">
          <label htmlFor="drinks">Choose Drinks:</label>
          <div id="drinks">
          {combo.details.drinks.map((drink) => (
            <label key={drink}>
              <input
                type="checkbox"
                value={drink}
                checked={selectedDrinks.includes(drink)}
                onChange={() => handleDrinkSelection(drink)}
              />
              {drink}
            </label>
           
          ))}
 </div>
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
   </div>        </div>
   <div className="form-wrap">
   <div className="form-group">
   <label htmlFor="quantity">Quantity:</label>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} />
          </div></div>
           
            <p className="details-total">Total: ${(calculateTotalPrice() * quantity).toFixed(2)}</p>
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

export default ComboDetails;