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
import Cart from './components/Cart';
import Checkout from './pages/CheckoutPage';
import Payment from './pages/PaymentPage';
import ManageContacts from './components/ManageContacts';
import Login from './components/Login'; // Import Login page
import Register from './components/Register'; // Import Register page if required
import { GoogleOAuthProvider } from '@react-oauth/google';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentPage from './pages/PaymentPage';
import Myorders from './components/MyOrders';
const stripePromise = loadStripe('pk_test_51QjvRCBpoKRfd7wJg46FVlz6xnmYIiy5Co4IAaIOummGpsWFqNkDo0fyo9zriDBl1aETR0sV4LBUCPiOMyZqVlF300Dg0jS3oe');

const App = () => {
  return (
    
    <GoogleOAuthProvider clientId="471126766852-ghap4haabnrqjnpb6aq5s7am7b6hiho8.apps.googleusercontent.com">
   
   <Elements stripe={stripePromise}>
    
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
           <Route
              path="/payment"
              element={
               
                  <PaymentPage />
               
              }
            />
           <Route path="/login" element={<Login />} /> {/* Login Route */}
           <Route path="/register" element={<Register />} />
           <Route path="/my-orders" element={<Myorders />} />
           <Route path="/managecontacts" element={<ManageContacts />} />
        </Route>
      </Routes>
    </Router>
    </Elements>
      </GoogleOAuthProvider>
  );
};

export default App;
