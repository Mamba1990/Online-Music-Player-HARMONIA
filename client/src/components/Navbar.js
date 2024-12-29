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
            <Link to="/">Home</Link>
            <Link to="/playlists">Playlists</Link>
            <Link to="/tracks">Tracks</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Log In</Link>
            </ul>
        </nav>
    );
};

export default Navbar;

