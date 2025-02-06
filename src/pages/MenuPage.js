import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MenuCard from '../components/MenuCard';
import '../styles/MenuPage.css';
const MenuPage = ({ category }) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/menu`);
        const filteredItems = response.data.filter(item => item.category === category);
        setMenuItems(filteredItems);
      } catch (err) {
        console.error('Error fetching menu items:', err);
      }
    };

    fetchMenuItems();
  }, [category]);

  return (
    <div className="menu-page">
      <h2>{category} Menu</h2>
      <div className="menu-grid">
        {menuItems.map(item => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
