🎵 **Online Music Player: Harmonia**
Harmonia is an online music player allowing users to manage tracks and playlists, upload audio files, and play music seamlessly.

---

## 🚀 Features
- **User Authentication**: JWT-based secure authentication..
- **Track Management**: Create, view, update, and delete tracks.
- **Playlist Management**: Create and manage playlists with associated tracks.
- **Frontend**: Simple React-based interface

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js

### Backend
- **Server**: Node.js with Express
- **Database**: MongoDB (NoSQL)
- **Authentication**: JSON Web Tokens (JWT)

### Third-Party APIs
- Spotify API (Future Enhancement, not implemented yet)

---

## 📋 Prerequisites
Before running this project, ensure you have the following installed on your system:
- **Node.js**: [Download Node.js](https://nodejs.org/)
- **MongoDB**: Set up locally or hosted on a cloud service, [install MongoDB](https://www.mongodb.com/try/download/community)
- **API Keys**: Obtain keys for the chosen Music API Spotify.
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
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/harmonia
JWT_SECRET=my_super_secret_key
```

---

## 📂 Project Structure

```
├── client/               # Frontend (React app)
│   ├── public/           # Static assets
│   └── src/              # React components, pages, and styles
├── server/               # Backend (Node.js + Express)
│   ├── models/           # Database schemas
│   │   ├── Playlist.js   # Playlist schema
│   │   ├── Track.js      # Track schema
│   │   └── User.js       # User schema
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication routes
│   │   ├── playlistsRoutes.js # Playlist routes
│   │   ├── tracksRoutes.js    # Track routes
│   │   └── usersRoutes.js     # User routes
│   ├── middleware/       # Middleware functions
│   │   ├── authMiddleware.js # Authentication middleware
│   │   └── adminMiddleware.js # Admin middleware
│   ├── uploads/          # Uploaded audio files
│   ├── db.js             # Database connection
│   ├── app.js            # Express application setup
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

### Authentication
- **POST /auth/signup**: Register a user.
  - **Example response:**
    ```json
    { "name": "Hafsa Daoudim", "email": "h.daoudom@outlook.com" }
    ```
- **POST /auth/login**: Authenticate a user and receive a JWT.
  - **Example request:**
    ```json
    {"email": "h.daoudim@outlook.com", "password": "************"}
    ```

### Playlists
- **GET /playlists**: Fetch all playlists (public).
- **POST /playlists**: Add a new playlist (requires authentication).
- **GET /playlists/:id**: Fetch a specific playlist (public).
- **PUT /playlists/:id**: Update a playlist (requires admin role or playlist owner authentication).
- **DELETE /playlists/:id**: Delete a playlist (requires admin role or owner authentication).

### Tracks
- **GET /tracks**: Fetch all tracks (public).
- **POST /tracks**: Add a new track (requires admin role).
- **GET /tracks/:id**: Fetch a specific track (public).
- **PUT /tracks/:id**: Update a track (requires admin role).
- **DELETE /tracks/:id**: Delete a track (requires admin role).

### Upload
- **POST /upload**: Upload an audio file and add metadata (requires admin role).

---

## 🧪 Testing

Run tests for the backend:
```bash
cd server
npm test
```

---

## 🚀 Deployment
This project can be deployed on platforms like Heroku, AWS. Deployment details will be added once finalized.

---

## 🚀 Future Enhancements
- Improved Frontend styling and responsiveness.
- Advanced playback features (shuffle, repeat, etc.).

---

## 🛡️ License
This project is licensed under the MIT License.

---

## 📧 Contact
For questions or feedback, contact:
- **Email**: hafsa.daoudim@gmail.com
- **GitHub**: [Mamba1990](https://github.com/Mamba1990)
- **LinkedIn**: [My Profile](#)
