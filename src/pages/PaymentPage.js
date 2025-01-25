import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Payment.css';

const PaymentPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentOption, setPaymentOption] = useState('online');
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    // Fetch the total amount and cart items
    const fetchCartDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
        console.log("response",response.data);
        const cart = response.data;
        setTotalAmount(cart.totalPrice);
        setCartItems(response.data.items || []); // Ensure an array is set       
        console.log("cart",cart);
        // Create a Payment Intent on the server
        const paymentIntentResponse = await axios.post('http://localhost:5000/api/payment/create-payment-intent', {
          amount: cart.totalPrice * 100, // Amount in cents
          userId,
          currency: 'cad',
        });
        setClientSecret(paymentIntentResponse.data.clientSecret);
      } catch (error) {
        console.error('Error fetching cart details:', error.message);
      }
    };

    fetchCartDetails();
  }, [userId]);

  const handlePayment = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      if (paymentOption === 'online') {
        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (paymentResult.error) {
          setErrorMessage(paymentResult.error.message);
        } else if (paymentResult.paymentIntent.status === 'succeeded') {
          alert('Payment successful!');

          console.log("paymentResult.paymenet intend",paymentResult.paymentIntent);
          // Update the cart status and move it to orders collection
          await axios.post('http://localhost:5000/api/cart/complete-order', {
            userId,
            paymentIntentId: paymentResult.paymentIntent.id,
            paymentOption: 'online',
          });

          // Redirect to order confirmation page
          navigate('/my-orders');
        }
      } else {
        // Handle other payment options (pay when pickup or delivery, pay in cash)
        await axios.post('http://localhost:5000/api/cart/complete-order', {
          userId,
          paymentIntentId: null, // No payment intent ID for non-online payments
          paymentOption,
        });

        alert('Order placed successfully!');

        // Redirect to order confirmation page
        
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Error during payment:', error.message);
      setErrorMessage('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="order-summary">
        <h2>Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item._id} className="order-item">
            <p>{item.productId.name}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ${item.totalPrice.toFixed(2)}</p>
          </div>
        ))}
        <h3>Total: ${totalAmount.toFixed(2)}</h3>
      </div>

      <div className="payment-section">
        <h1>Payment</h1>
        <p>Total Amount: ${totalAmount.toFixed(2)}</p>

        <form onSubmit={handlePayment}>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                value="online"
                checked={paymentOption === 'online'}
                onChange={() => setPaymentOption('online')}
              />
              Pay Now Online
            </label>
            <label>
              <input
                type="radio"
                value="pickup"
                checked={paymentOption === 'pickup'}
                onChange={() => setPaymentOption('pickup')}
              />
              Pay When Pickup or Delivery
            </label>
            <label>
              <input
                type="radio"
                value="cash"
                checked={paymentOption === 'cash'}
                onChange={() => setPaymentOption('cash')}
              />
              Pay in Cash
            </label>
          </div>

          {paymentOption === 'online' && (
            <div className="card-input">
              <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } }, invalid: { color: '#9e2146' } } }} />
            </div>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button className="pay-button" type="submit" disabled={isProcessing || !stripe || !elements}>
            {isProcessing ? 'Processing...' : paymentOption === 'online' ? 'Pay Now' : 'Place My Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;