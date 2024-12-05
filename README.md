# 🎵 Online Music Player: Harmonia

Harmonia is an online music streaming platform where users can create playlists, search for songs, and enjoy music with advanced playback controls.

---

## 🚀 Features

- **User Authentication**: Secure user registration, login, and logout functionality.
- **Music Search**: search for songs by title, artist, or genre
- **Music Playback Controls**: Play, pause, skip, forward, rewind, and adjust volume.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

- **Frontend**: React
- **Backend**: Node.js
- **Database**: MongoDB
- **Music API**: Spotify API / Last.fm API / YouTube Data API

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed on your system:

- Node.js: [Download](https://nodejs.org/)
- MongoDB set up locally or hosted on a cloud service
- API keys for the chosen Music API (e.g., Spotify, Last.fm)
- [Git]: (Install Git)

---

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mamba1990/online-music-player-HARMONIA.git
   cd online-music-player-HARMONIA

2. Install dependencies for the backend:
   ```bash
   cd backend
   npm install

3. Install dependencies for the frontend:
   ```bash
   cd ../frontend
   npm install

4. Configure environment variables:
   Create a .env file in the backend directory with:
   ```makefile
   PORT=5000
   MONGO_URI=your-mongodb-connection-string
   API_KEY=your-music-api-key
   
---

## 🖥️ Usage

1. Start the backend server:
   ```bash
   cd backend
   npm start

2. Start the frontend development server:
   ```bash
   cd ../frontend
   npm start

3. Open your browser and visit:
   ```arduino
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api
   
 ---  

## 📂 Project Structure
   ```graphql
Online-Music-Player-HARMONIA/
├── client/               # Frontend (React app)
│   ├── public/           # Static assets
│   └── src/              # React components, pages, and styles
├── server/               # Backend (Node.js + Express)
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   ├── controllers/      # Request handlers
│   ├── utils/            # Helper functions
│   └── server.js         # Entry point
├── .env                  # Environment variables
├── package.json          # Project dependencies
└── README.md             # Project documentation

   ```

---

## 🧪 Testing

1. **Run unit tests for the backend**:
   ```bash
   cd backend
   npm test
