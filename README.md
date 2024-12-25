🎵 **Online Music Player: Harmonia**
Harmonia is an online music streaming platform where users can create playlists, search for songs, and enjoy music with advanced playback controls.

---

## 🚀 Features
- **User Authentication**: Secure user registration, login, and logout functionality.
- **Music Search**: Search for songs by title, artist, or genre.
- **Music Playback Controls**: Play, pause, skip, forward, rewind, and adjust volume.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js

### Backend
- **Server**: Node.js with Express
- **Database**: MongoDB (NoSQL)
- **Authentication**: JSON Web Tokens (JWT)

### Third-Party APIs
- Spotify API / Last.fm API / YouTube Data API

---

## 📋 Prerequisites
Before running this project, ensure you have the following installed on your system:
- **Node.js**: [Download Node.js](https://nodejs.org/)
- **MongoDB**: Set up locally or hosted on a cloud service, [install MongoDB](https://www.mongodb.com/try/download/community)
- **API Keys**: Obtain keys for the chosen Music API (e.g., Spotify, Last.fm).
- **Git**: [Install Git](https://git-scm.com/)

---

## ⚙️ Installation

### Clone the Repository
```bash
git clone https://github.com/Mamba1990/online-music-player-HARMONIA.git
cd online-music-player-HARMONIA
```

### Backend Setup
Navigate to the `server/` folder:
```bash
cd server
```
Install dependencies:
```bash
npm install
```

### Frontend Setup
Navigate to the `client/` folder:
```bash
cd ../client
```
Install dependencies:
```bash
npm install
```

### Configure Environment Variables
Create a `.env` file in the `server/` directory and add the following:
```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
API_KEY=your-music-api-key
```
Replace `your-mongodb-connection-string` and `your-music-api-key` with your actual values.

---

## 📂 Project Structure
```
Online-Music-Player-HARMONIA/
├── client/               # Frontend (React app)
│   ├── public/           # Static assets
│   └── src/              # React components, pages, and styles
├── server/               # Backend (Node.js + Express)
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   ├── controllers/      # Request handlers
│   ├── utils/            # Helper functions
│   ├── db.js             # Database connection
│   └── server.js         # Entry point
├── tests/                # Test files
│   ├── playlists.test.js # Playlist route tests
│   ├── tracks.test.js    # Track route tests
│   └── users.test.js     # User route tests
├── .env                  # Environment variables
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

---

## 📋 API Endpoints

### **Users**
- **GET** `/users`: Fetch all users.
  - Example response:
    ```json
    [
      { "id": 1, "name": "John Doe", "email": "john@example.com" }
    ]
    ```
- **POST** `/users`: Add a new user.
  - Example request:
    ```json
    { "name": "Jane Doe", "email": "jane@example.com" }
    ```

### **Playlists**
- **GET** `/playlists`: Fetch all playlists.
- **POST** `/playlists`: Create a new playlist.

### **Tracks**
- **GET** `/tracks`: Fetch all tracks.
- **POST** `/tracks`: Add a new track.

---

## 🧪 Testing

Run tests for the backend:
```bash
cd server
npm test
```

---

## 🚀 Deployment
This project can be deployed on platforms like Heroku, AWS, or Vercel. Deployment details will be added once finalized.

---

## 🛡️ License
This project is licensed under the MIT License.

---

## 📧 Contact
For questions or feedback, contact:
- **Email**: hafsa.daoudim@gmail.com
- **GitHub**: [Mamba1990](https://github.com/Mamba1990)
- **LinkedIn**: [My Profile](#)
