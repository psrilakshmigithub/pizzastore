import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-red-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Pizza Store</Link>
      <div className="space-x-4">
        <Link to="/cart" className="hover:underline">Cart</Link>
        <Link to="/login" className="hover:underline">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;