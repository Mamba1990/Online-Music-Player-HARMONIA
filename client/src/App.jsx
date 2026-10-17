import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import PlaylistsPage from './pages/PlaylistsPage'
import ProfilePage from './pages/ProfilePage'
import TrackPage from './pages/TrackPage'
import PlaylistDetailsPage from './pages/PlaylistDetailsPage'
import TrackDetailsPage from './pages/TrackDetailsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AudioPlayerPage from './pages/AudioPlayerPage'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/audio-player" element={<AudioPlayerPage />} />

            {/* Routes protégées : redirection vers /login sans token */}
            <Route
              path="/profile"
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
            />
            <Route
              path="/playlists"
              element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>}
            />
            <Route
              path="/playlists/:id"
              element={<ProtectedRoute><PlaylistDetailsPage /></ProtectedRoute>}
            />
            <Route
              path="/tracks"
              element={<ProtectedRoute><TrackPage /></ProtectedRoute>}
            />
            <Route
              path="/tracks/:id"
              element={<ProtectedRoute><TrackDetailsPage /></ProtectedRoute>}
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App