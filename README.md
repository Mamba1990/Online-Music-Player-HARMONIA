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

**Frontend**
- **Framework**: React.js

**Backend**
- **Server**: Node.js with express
- **Database**: MongoDB(NoSQL)
- **Authentication**: JSON Web Tokens (JWT)
  
**Third-Party APIs**
- Spotify API / Last.fm API / YouTube Data API

---


## 📋 Prerequisites

Before running this project, ensure you have the following installed on your system:

- Node.js: [Download Node.js](https://nodejs.org/)
- MongoDB : set up locally or hosted on a cloud service, [install MongoDB](https://www.mongodb.com/try/download/community)
- API keys for the chosen Music API (e.g., Spotify, Last.fm)
- Git: [Install Git](https://git-scm.com/)

---

## ⚙️ Installation

1. Clone the repository:
   
   ```bash
   git clone https://github.com/Mamba1990/online-music-player-HARMONIA.git
   cd online-music-player-HARMONIA

3. **Set up the backend**:

   - Navigate to the server/ folder:
     
     ```bash
     cd server
   - Install the required dependencies:
     
     ```bash
     npm install

4. **Set up the frontend**:
 
   - Navigate to the client/ folder:
     
     ```bash
     cd ../client
   
   - Install the required dependencies:
     
      ```bash
      npm install

5. **Configure environment variables**:
   
   - Create a .env file in the server/ directory and add the following:
     
      ```plaintext
      PORT=5000
      MONGO_URI=your-mongodb-connection-string
      API_KEY=your-music-api-key
      ```
   - Replace your-mongodb-connection-string and your-music-api-key with your actual values.
   
---

## 🖥️ Usage

1. **Start the backend server**:
   
   - Navigate to the server/ folder:
     
   ```bash
   cd server
   npm start

3. **Start the frontend development server**:
   
   - Navigate to the client/ folder:
      
   ```bash
   cd ../client
   npm start

4. **Open your browser and visit**:
   
   ```arduino
   http://localhost:3000
   
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
