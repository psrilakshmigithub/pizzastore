import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PizzaDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [extraToppingPrice, setExtraToppingPrice] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await axios.get(`/api/products/${productId}`);
      setProduct(response.data);
      setExtraToppingPrice(response.data.details.extraToppingPrice || 0);
    };

    const fetchToppings = async () => {
      const response = await axios.get('/api/toppings');
      setToppings(response.data);
    };

    fetchProduct();
    fetchToppings();
  }, [productId]);

  const handleToppingSelection = (topping) => {
    if (selectedToppings.includes(topping)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== topping));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const calculateTotalPrice = () => {
    const freeToppings = product.details.toppingsPerPizza;
    const extraToppings = Math.max(0, selectedToppings.length - freeToppings);
    return (
      product.price +
      extraToppings * extraToppingPrice +
      quantity * product.price
    );
  };

  const handleOrder = async () => {
    await axios.post('/api/orders', {
      productId: product._id,
      toppings: selectedToppings,
      quantity,
      totalPrice: calculateTotalPrice(),
    });
    alert('Order placed successfully!');
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{`Price: $${product.price}`}</p>
      <h3>Select Toppings:</h3>
      {toppings.map((topping) => (
        <label key={topping._id}>
          <input
            type="checkbox"
            value={topping.name}
            onChange={() => handleToppingSelection(topping.name)}
          />
          {topping.name}
        </label>
      ))}
      <p>{`Selected Toppings: ${selectedToppings.join(', ')}`}</p>
      <p>{`Total Price: $${calculateTotalPrice().toFixed(2)}`}</p>
      <button onClick={handleOrder}>Place Order</button>
    </div>
  );
};

export default PizzaDetails;
