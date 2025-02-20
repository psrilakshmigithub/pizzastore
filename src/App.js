import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import Category from "./components/Category";
import WingsDetails from "./components/WingsDetails";
import ComboDetails from "./components/ComboDetails";
import FamilyComboDetails from "./components/FamilyComboDetails";
import MegaComboDeal from "./components/MegaComboDeal";
import ThreeForOneDetails from "./components/ThreeForOneDetails";
import TwoForOneDetails from "./components/TwoForOneDetails";
import PanzerotteDetails from "./components/PanzerotteDetails";
import BeveragesDetails from "./components/Beverages";
import SuperBowlWingsDetails from "./components/SuperBowlWingsDetails";
import Sides from "./components/Sides";
import Cart from "./components/Cart";
import Checkout from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import ManageContacts from "./components/ManageContacts";
import Login from "./components/Login";
import axios from "axios";
import Register from "./components/Register";
import MyOrders from "./components/MyOrders";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Load Stripe public key from environment variable
const stripePromise = loadStripe("pk_live_51QjvRCBpoKRfd7wJLoHqey6AXZvDmoV2Smpv99LLnBOBs0VMnPXmTJOxhxvEKavyhVBtkW07EPmsXl6QaPBKpkSo00ArCoNkYE");

const App = () => {
  const [storeOpen, setStoreOpen] = useState(true);
  const location = useLocation(); // useLocation hook to detect route changes

  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/store/status`);
        console.log("process.env.REACT_APP_API_BASE_URL, response", process.env.REACT_APP_API_BASE_URL, response);
        setStoreOpen(response.data.storeOpen);
      } catch (error) {
        console.error("Error fetching store status:", error);
      }
    };

    fetchStoreStatus();
  }, []);

  useEffect(() => {
    // Send page view to Google Analytics every time the location changes
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
      });
    }
  }, [location]); // This effect runs whenever the location changes

  return (
    <GoogleOAuthProvider clientId="471126766852-ghap4haabnrqjnpb6aq5s7am7b6hiho8.apps.googleusercontent.com">
      <Elements stripe={stripePromise}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage storeOpen={storeOpen} />} />
              <Route path="category/:category" element={<Category />} />
              <Route path="wings/:id" element={<WingsDetails />} />
              <Route path="combos/:id" element={<ComboDetails />} />
              <Route path="familycombos/:id" element={<FamilyComboDetails />} />
              <Route path="megadealcombo/:id" element={<MegaComboDeal />} />
              <Route path="twoforonedeals/:id" element={<TwoForOneDetails />} />
              <Route path="threeforonedeals/:id" element={<ThreeForOneDetails />} />
              <Route path="panzerotti/:id" element={<PanzerotteDetails />} />
              <Route path="category/beverages" element={<BeveragesDetails />} />
              <Route path="sides/:id" element={<Sides />} />
              <Route path="/superbowlcombo/:id" element={<SuperBowlWingsDetails />} />
              <Route path="/cart" element={<Cart storeOpen={storeOpen} />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<PaymentPage storeOpen={storeOpen} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/managecontacts" element={<ManageContacts />} />
              {/* Catch-all route to redirect to homepage */}
              <Route path="*" element={<HomePage storeOpen={storeOpen} />} /> {/* Fallback route */}
            </Route>
          </Routes>
        </Router>
      </Elements>
    </GoogleOAuthProvider>
  );
};

export default App;
