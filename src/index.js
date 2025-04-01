// Polyfills for Safari compatibility

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from "./context/userContext"; 

// Create the root for rendering
const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap App with providers and render
root.render(
  <React.StrictMode>
   <UserProvider>
   <App />
   </UserProvider>     
     
  </React.StrictMode>
);
