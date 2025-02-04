import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.css';

const HomePage = () => {  
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        const filteredItems = response.data.reduce((acc, item) => {
          // Show only one card for the "Beverages" category
          if (item.category === 'Beverages') {
            if (!acc.some((i) => i.category === 'Beverages')) {
              acc.push({
                ...item,
                name: 'Beverages', // Override name for a unified card
              });
            }
          }
          else if (item.category === 'Sides') {
            if (!acc.some((i) => i.category === 'Sides')) {
              acc.push({
                ...item,
                name: 'Sides', // Override name for a unified card
              });
            }
          } else {
            acc.push(item);
          }
          return acc;
        }, []);
        setItems(filteredItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen">     
      <main className="main">
        <h2 className="main-title">Categories</h2>
        <div className="grid-layout">         
          {items.map((item) => (
            <div key={item._id} className="item-card">
              {/* Dynamic redirection to details page based on category */}
              <Link
                to={
                  item.category === 'Beverages'
                    ? `/category/beverages`
                    : `/${item.category.toLowerCase()}/${item._id}`
                }               
              >
                <img
                  src={`http://localhost:5000${item.image}`}
                  alt={item.name}
                  className="category-card-image"
                />
                <h3 className="category-card-title">{item.name}</h3>              
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
