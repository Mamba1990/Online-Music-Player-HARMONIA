import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Button from './components/Button'; // Import the Button component
import HomePage from './pages/HomePage';
import PlaylistsPage from './pages/PlaylistsPage';
import ProfilePage from './pages/ProfilePage';
import TrackPage from './pages/TrackPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage'; 
import TrackDetailsPage from './pages/TrackDetailsPage';       
import LoginPage from './pages/LoginPage'; 
import SignupPage from './pages/SignupPage';
import background from './assets/background.png'; // Import the background image

function App() {
    return (
        <Router>
            <div className="App" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
                <Navbar />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/playlists" element={<PlaylistsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/tracks" element={<TrackPage />} />
                        {/* New Routes for Playlist and Track Details */}
                        <Route path="/playlists/:id" element={<PlaylistDetailsPage />} />
                        <Route path="/tracks/:id" element={<TrackDetailsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                    </Routes>
                </div>
                <div className="action-buttons">
                    <Button label="Explore Playlists" onClick={() => window.location.href = '/playlists'} />
                    <Button label="My Profile" onClick={() => window.location.href = '/profile'} />
                </div>
                <Footer />
            </div>
        </Router>
    );
}
export default App;
