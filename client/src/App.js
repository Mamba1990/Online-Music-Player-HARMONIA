import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PlaylistsPage from './pages/PlaylistsPage';
import ProfilePage from './pages/ProfilePage';
import TrackPage from './pages/TrackPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage'; // Import PlaylistDetailsPage
import TrackDetailsPage from './pages/TrackDetailsPage';       // Import TrackDetailsPage
import LoginPage from './pages/LoginPage'; // Add LoginPage
import SignupPage from './pages/SignupPage'; // Add SignupPage

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
                        {/* New Routes for Playlist and Track Details */}
                        <Route path="/playlists/:id" element={<PlaylistDetailsPage />} />
                        <Route path="/tracks/:id" element={<TrackDetailsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;


