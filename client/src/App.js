import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginForm from './components/forms/LoginForm';
import SignupForm from './components/forms/SignupForm';
/*import Button from './components/Button'; // Import the Button component */
import HomePage from './pages/HomePage';
import PlaylistsPage from './pages/PlaylistsPage';
import ProfilePage from './pages/ProfilePage';
import TrackPage from './pages/TrackPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage'; 
import TrackDetailsPage from './pages/TrackDetailsPage';       
import LoginPage from './pages/LoginPage'; 
import SignupPage from './pages/SignupPage';
import AudioPlayerPage from './pages/AudioPlayerPage'
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
	    		<Route path="/login" element={<LoginForm />} />
                	<Route path="/signup" element={<SignupForm />} />
                        <Route path="/audio-player" element={<AudioPlayerPage />} />
                    </Routes>
                </div>
        
                <Footer />
            </div>
        </Router>
    );
}
export default App;
