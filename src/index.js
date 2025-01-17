import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


// Create the root for rendering
const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap App with providers and render
root.render(
  <React.StrictMode>
   
        <App />
     
  </React.StrictMode>
);
