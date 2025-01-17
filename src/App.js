import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Category from './components/Category';
import WingsDetails from './components/WingsDetails';
import ComboDetails from './components/ComboDetails';
import FamilyComboDetails from './components/FamilyComboDetails';
import ThreeForOneDetails from './components/ThreeForOneDetails';
import TwoForOneDetails from './components/TwoForOneDetails';
import PanzerotteDetails from './components/PanzerotteDetails';
import BeveragesDetails from './components/Beverages';
import Cart from './pages/CartPage';
import Checkout from './pages/CheckoutPage';
import Payment from './pages/PaymentPage';
import ManageContacts from './components/ManageContacts';
import Login from './components/Login'; // Import Login page
import Register from './components/Register'; // Import Register page if required
import { GoogleOAuthProvider } from '@react-oauth/google';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentPage from './pages/PaymentPage';
// const stripePromise = loadStripe('your_stripe_publishable_key');

const App = () => {
  return (
    
    <GoogleOAuthProvider clientId="471126766852-ghap4haabnrqjnpb6aq5s7am7b6hiho8.apps.googleusercontent.com">
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="category/:category" element={<Category />} />
          <Route path="wings/:id" element={<WingsDetails />} />
          <Route path="combos/:id" element={<ComboDetails />} />
          <Route path="familycombos/:id" element={<FamilyComboDetails />} />;
          <Route path="twoforonedeals/:id" element={<TwoForOneDetails />} />
          <Route path="threeforonedeals/:id" element={<ThreeForOneDetails />} />
          <Route path="panzerotte/:id" element={<PanzerotteDetails />} />
          <Route path="category/beverages" element={<BeveragesDetails />} />
          <Route path="/cart" element={<Cart />} />
           <Route path="/checkout" element={<Checkout />} />
           {/* <Route
              path="/payment"
              element={
                <Elements stripe={stripePromise}>
                  <PaymentPage />
                </Elements>
              }
            /> */}
           <Route path="/login" element={<Login />} /> {/* Login Route */}
           <Route path="/register" element={<Register />} />
           <Route path="/managecontacts" element={<ManageContacts />} />
        </Route>
      </Routes>
    </Router>
      </GoogleOAuthProvider>
  );
};

export default App;
