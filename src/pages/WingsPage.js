import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MenuCard from '../components/MenuCard';
import '../styles/Pages.css';

const WingsPage = () => {
    const [wings, setWings] = useState([]);

    useEffect(() => {
        const fetchWings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/menu?category=Wings');
                setWings(response.data);
            } catch (err) {
                console.error('Error fetching wings menu:', err.message);
            }
        };

        fetchWings();
    }, []);

    return (
        <div className="menu-page">
            <h2>Wings Menu</h2>
            <div className="menu-grid">
                {wings.map((item) => (
                    <MenuCard key={item._id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default WingsPage;
