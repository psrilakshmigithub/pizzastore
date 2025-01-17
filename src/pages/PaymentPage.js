import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
//import '../styles/Payment.css';

const PaymentPage = ({ totalAmount, userId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Create Payment Intent
      const { data } = await axios.post('http://localhost:5000/api/orders/create-payment-intent', {
        amount: totalAmount,
        userId,
      });

      const clientSecret = data.clientSecret;

      // Confirm Payment
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (paymentResult.error) {
        setErrorMessage(paymentResult.error.message);
      } else if (paymentResult.paymentIntent.status === 'succeeded') {
        alert('Payment successful!');
        // Redirect to order confirmation page
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
      <h1>Payment</h1>
      <p>Total Amount: ${totalAmount.toFixed(2)}</p>

      <div className="card-input">
        <CardElement />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button
        className="pay-button"
        onClick={handlePayment}
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default PaymentPage;
