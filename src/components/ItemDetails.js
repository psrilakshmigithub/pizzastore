import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ItemDetails.css';

const ItemDetails = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [extras, setExtras] = useState({ toppings: [] });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/details/${itemId}`);
        setItem(response.data);
        setTotalPrice(response.data.price);
      } catch (error) {
        console.error('Error fetching item:', error);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleToppingChange = (topping) => {
    setExtras((prev) => {
      const updatedToppings = prev.toppings.includes(topping)
        ? prev.toppings.filter((t) => t !== topping)
        : [...prev.toppings, topping];
      return { ...prev, toppings: updatedToppings };
    });
  };

  useEffect(() => {
    const calculatePrice = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/pricing', {
          itemId,
          extras,
        });
        setTotalPrice(response.data.totalPrice);
      } catch (error) {
        console.error('Error calculating price:', error);
      }
    };
    calculatePrice();
  }, [extras, itemId]);

  if (!item) return <p>Loading...</p>;

  return (
    <div className="min-h-screen">
      <header className="header">
        <h1 className="header-title">{item.name}</h1>
      </header>
      <main className="main">
        <div className="item-container">
          <h2 className="item-title">{item.name}</h2>
          <p className="item-price">Base Price: ${item.price.toFixed(2)}</p>
          <div className="topping-list">
            {item.details.toppings.map((topping, index) => (
              <label key={index} className="topping-label">
                <input
                  type="checkbox"
                  value={topping}
                  onChange={() => handleToppingChange(topping)}
                  className="topping-input"
                />
                {topping}
              </label>
            ))}
          </div>
          <h2 className="total-price">Total Price: ${totalPrice.toFixed(2)}</h2>
          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </main>
    </div>
  );
};

export default ItemDetails;