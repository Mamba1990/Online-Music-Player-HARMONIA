import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
//import Button from './components/Button'; // Import the Button component
import HomePage from './pages/HomePage';
import PlaylistsPage from './pages/PlaylistsPage';
import ProfilePage from './pages/ProfilePage';
import TrackPage from './pages/TrackPage';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/playlists" element={<PlaylistsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/tracks" element={<TrackPage />} />
                    </Routes>
                </div>
               
                <Footer />
            </div>
        </Router>
    );
}

export default App;

