import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Category.css';


const Category = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${category}`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, [category]);

  return (
    <div className="min-h-screen">
      <header className="header">
        <h1 className="header-title">{category}</h1>
      </header>
      <main className="main">
        <h2 className="main-title">Available Items</h2>
        <div className="item-grid">
       
          {items.map((item, index) => (
            <Link
            to={`/${item.category.toLowerCase()}/${item._id}`}
            key={index}
            className="item-card"
          >
            <img src={`http://localhost:5000${item.image}`} alt={item.name} className="item-card-image" />
            <h3 className="item-card-title">{item.name}</h3>
            <p className="item-card-price">${item.price.toFixed(2)}</p>
          </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Category;