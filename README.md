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
├── tests/                # Test files
│   ├── playlists.test.js # Playlist route tests
│   ├── tracks.test.js    # Track route tests
│   └── users.test.js     # User route tests
├── .env                  # Environment variables
├── package.json          # Project dependencies
└── README.md             # Project documentation


   ```

---

## 🗓️ Project Timeline

Week	Task
1	Initial setup & landing page design
2	Backend development & API integration
3	Core features: Playlist & playback
4	Testing, deployment, and presentation

---

## 🧪 Testing

---

## 🚀 Deployment

---



## 🔗 Live Demo

Coming soon! (Once deployed, add the live link here.)

---

## 🤝 Contributing

Contributions are welcome! If you’d like to contribute:
1. Fork the project.
2. Create a feature branch: git checkout -b feature-name.
3. Commit changes: git commit -m 'Add some feature'.
4. Push to the branch: git push origin feature-name.
5. Open a pull request.

---

## 🛡️ License

This project is licensed under the MIT License.

---

## 📧 Contact

For questions or feedback, contact:
- **Email**: hafsa.daoudim@gmail.com
- **GitHub**: [Mamba1990](https://github.com/Mamba1990)
- **LinkedIn**: [My profile](https://www.linkedin.com/in/hafsadaoudim/)
