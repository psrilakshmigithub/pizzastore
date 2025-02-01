import React, { useState, useEffect, useRef } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/Payment.css';

const PaymentPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentOption, setPaymentOption] = useState("online");
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const eventSourceRef = useRef(null);

  // Fetch cart details
  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
        const cart = response.data;
        setTotalAmount(cart.totalPrice);
        setCartItems(cart.items);

        const paymentIntentResponse = await axios.post("http://localhost:5000/api/payment/create-payment-intent", {
          amount: cart.totalPrice * 100,
          userId,
          currency: "cad",
        });

        setClientSecret(paymentIntentResponse.data.clientSecret);
      } catch (error) {
        setErrorMessage("⚠️ Failed to fetch cart details. Try again.");
      }
    };

    fetchCartDetails();
  }, [userId]);

  // SSE Connection for Order Confirmation
  useEffect(() => {
    if (!orderId) return;

    const eventSource = new EventSource(`http://localhost:5000/api/orders/sse?userId=${userId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "order-confirmed" && data.orderId === orderId) {
        alert("✅ Your order has been confirmed!");
        setIsWaitingForConfirmation(false);
        navigate("/my-orders");
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error("⚠️ SSE Connection Error:", error);
      setTimeout(() => {
        eventSource.close();
      }, 5000);
    };

    eventSourceRef.current = eventSource;

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [orderId, userId, navigate]);

  const handlePayment = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      let paymentIntentId = null;

      if (paymentOption === "online") {
        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (paymentResult.error) {
          throw new Error(paymentResult.error.message);
        } else if (paymentResult.paymentIntent.status === "succeeded") {
          paymentIntentId = paymentResult.paymentIntent.id;
        }
      }

      const response = await axios.post("http://localhost:5000/api/orders/complete-order", {
        userId,
        paymentIntentId,
        paymentOption,
      });

      setOrderId(response.data.order._id);
      setIsWaitingForConfirmation(true);
    } catch (error) {
      setErrorMessage(error.message || "⚠️ Payment failed.");
      setIsWaitingForConfirmation(false);
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
            <input type="radio" value="online" checked={paymentOption === "online"} onChange={() => setPaymentOption("online")} />
            Pay Now Online
          </label>
          <label>
            <input type="radio" value="pickup" checked={paymentOption === "pickup"} onChange={() => setPaymentOption("pickup")} />
            Pay When Pickup or Delivery
          </label>
          <label>
            <input type="radio" value="cash" checked={paymentOption === "cash"} onChange={() => setPaymentOption("cash")} />
            Pay in Cash
          </label>
        </div>
        {paymentOption === 'online' && (
          <div className="card-input">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>
        )}


        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" disabled={isProcessing || !stripe || !elements}>
          {isProcessing ? "Processing..." : "Place My Order"}
        </button>
      </form>
      </div>
      {isWaitingForConfirmation && (
        <div className="overlay">
          <div className="popup">
            <h2>⏳ Waiting for Order Confirmation...</h2>
            <p>Hold tight! The admin is reviewing your order.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
