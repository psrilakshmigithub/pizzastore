import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuCard.css';

const MenuCard = ({ item }) => {
    return (
        <div className="menu-card">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>${item.price.toFixed(2)}</p>
            <Link to={`/menu/${item._id}`} className="order-now-button">Order Now</Link>
            
        </div>
    );
};

export default MenuCard;
