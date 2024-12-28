import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/Harmonia-logo.png'; // Adjust the path as necessary

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src={logo} alt="Harmonia Logo" className="navbar-logo-image" />
                <span className="navbar-logo-text"></span>
            </div>
            <ul className="navbar-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/playlists">Playlists</Link></li>
                <li><Link to="/tracks">Tracks</Link></li>
                <li><Link to="/profile">Profile</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;

