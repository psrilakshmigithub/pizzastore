import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/HomePage.css";

const HomePage = ({ storeOpen }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`);
        const filteredItems = response.data.reduce((acc, item) => {
          // Show only one card for "Beverages" and "Sides" categories
          if (["Beverages", "Sides"].includes(item.category)) {
            if (!acc.some((i) => i.category === item.category)) {
              acc.push({ ...item, name: item.category });
            }
          } else {
            acc.push(item);
          }
          return acc;
        }, []);
        setItems(filteredItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen">
      {!storeOpen && (
        <div className="store-closed-banner">
          <p>⚠️ The store is currently closed. We are not accepting orders at this time.</p>
        </div>
      )}
      <main className="main">
        <h2 className="main-title">Categories</h2>
        <div className="grid-layout">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <Link
                to={
                  item.category === "Beverages"
                    ? `/category/beverages`
                    : `/${item.category.toLowerCase()}/${item._id}`
                }
              >
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}${item.image}`}
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
