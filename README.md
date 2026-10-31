# 🎵 Harmonia

**Feel the rhythm, anytime, anywhere.**

Harmonia is a full-stack online music player. Users can sign up, browse tracks, build playlists and stream audio, while administrators upload and manage the music catalogue.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📌 Overview

| | |
|---|---|
| **Type** | Full-stack web application (SPA + REST API) |
| **Frontend** | React 19, React Router 7, Axios, built with Vite |
| **Backend** | Node.js, Express 4, Mongoose |
| **Database** | MongoDB |
| **Auth** | JWT (5 h expiry), bcrypt password hashing, role-based access (`user` / `admin`) |
| **Tests** | Mocha, Chai, Supertest (37 API tests) |
| **Containers** | Docker Compose (client served by Nginx, server, MongoDB) |

---

## ✨ Features

- **Authentication**: signup and login with JWT, protected routes on the client and the API.
- **Roles**: regular users manage their own playlists, administrators manage tracks and users.
- **Track catalogue**: browse and play tracks; admins upload audio files with metadata.
- **Playlists**: create, edit and delete playlists; only the owner or an admin can modify one.
- **Secure uploads**: audio-only filter, 30 MB limit, randomly generated file names.
- **Hardened API**: rate limiting on login and signup, security headers, input validation, no password leaks in responses.

> 💡 **Roadmap highlights:** a global audio player that keeps playing while you navigate, and a Spotify integration. See [Roadmap](#-roadmap).

---

## 🧱 Architecture

```
┌──────────────┐   HTTP / JSON    ┌──────────────┐    Mongoose    ┌──────────┐
│  React SPA   │ ───────────────▶ │  Express API │ ─────────────▶ │ MongoDB  │
│  (Vite)      │ ◀─────────────── │  :4000       │                └──────────┘
│  :3000       │   JWT in header  └──────┬───────┘
└──────┬───────┘                         │
       │        GET /uploads/<file>      ▼
       └───────────────────────▶  server/uploads (audio files)
```

The browser talks directly to the API. Audio files are streamed from `/uploads` on the API server.

---

## 🛠️ Tech Stack

### Frontend
- React 19 with React Router 7
- Vite 8 (dev server and production build)
- Axios, with a shared client that injects the JWT automatically

### Backend
- Node.js 22 and Express 4 (ES modules)
- MongoDB with Mongoose
- `jsonwebtoken` and `bcrypt` for authentication
- `multer` for uploads, `helmet` for security headers, `express-rate-limit` against brute force

### Tooling
- Mocha, Chai and Supertest for tests
- Docker and Docker Compose

---

## 📋 Prerequisites

- **Node.js 22** (Vite 8 requires 20.19+ or 22.12+). [Download](https://nodejs.org/)
- **Docker** and **Docker Compose** (recommended, also provides MongoDB). [Install Docker](https://docs.docker.com/get-docker/)
- **Git**

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mamba1990/online-music-player-HARMONIA.git
cd online-music-player-HARMONIA
```

### 2. Configure environment variables

Create a `.env` file at the **project root** (used by the server and Docker Compose):

```env
PORT=4000
MONGO_URI=mongodb://mongo:27017/harmonia
JWT_SECRET=replace-with-a-long-random-string
CLIENT_URL=http://localhost:3000
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:4000
```

> ⚠️ **Never commit `.env` files.** The server refuses to start if `JWT_SECRET` is missing. Only variables prefixed with `VITE_` are exposed to the browser, so never put a secret in `client/.env`.

### 3. Run the project

#### Option A: Docker Compose (everything at once)

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| MongoDB | `localhost:27017` |

Useful commands:

```bash
docker compose logs -f server         # follow the API logs
docker compose up -d --build server   # rebuild after a backend change
docker compose down                   # stop everything
```

> `VITE_API_URL` is baked into the frontend at **build time**. Rebuild the `client` image after changing it.

#### Option B: Local development (hot reload)

Start only MongoDB in Docker, then run the API and the frontend on your machine. In this mode, use `MONGO_URI=mongodb://localhost:27017/harmonia`.

```bash
# Terminal 1: database
docker compose up -d mongo

# Terminal 2: API
cd server
npm install
npm run dev

# Terminal 3: frontend
cd client
npm install
npm run dev
```

Open http://localhost:3000. The API only accepts requests from `CLIENT_URL`, so keep the port at 3000. If it is already taken, stop the process using it (Vite is configured with a fixed port).

### 4. Create an administrator

Signup always creates a regular user, because the role cannot be chosen by the client. Promote an existing account directly in the database:

```bash
docker exec -it mongo mongosh harmonia --eval \
  'db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })'
```

Log out and log in again to receive a token with the new role.

---

## 📂 Project Structure

```
.
├── client/                      # Frontend (React + Vite)
│   ├── public/                  # Static assets (favicon)
│   ├── src/
│   │   ├── api/                 # Axios client (base URL + JWT interceptor)
│   │   ├── assets/              # Logo and background
│   │   ├── components/          # Navbar, Footer, AudioPlayer, ProtectedRoute...
│   │   ├── pages/               # Home, Login, Signup, Profile, Tracks, Playlists...
│   │   ├── App.jsx              # Routes
│   │   └── index.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── Dockerfile
├── server/                      # Backend (Node.js + Express)
│   ├── middleware/              # authMiddleware, adminMiddleware, rateLimiters
│   ├── models/                  # User, Track, Playlist (Mongoose schemas)
│   ├── routes/                  # auth, users, tracks, playlists, upload
│   ├── tests/                   # API tests (Mocha + Supertest)
│   ├── uploads/                 # Uploaded audio files (git-ignored)
│   ├── app.js                   # Express app (middleware + routes)
│   ├── db.js                    # MongoDB connection
│   ├── server.js                # Entry point
│   └── Dockerfile
├── docker-compose.yml
├── .env                         # Environment variables (git-ignored)
└── README.md
```

---

## 🔌 API Reference

All responses use the shape `{ "success": true | false, ... }`. Errors include a `message`.

🔓 = public · 🔑 = authenticated · 🛡️ = admin only

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | 🔓 | Create an account (`name`, `email`, `password` of 8+ characters). The role is always `user`. |
| `POST` | `/auth/login` | 🔓 | Returns `{ token, user }`. |

Send the token on protected routes:

```
Authorization: Bearer <token>
```

<details>
<summary>Example: login</summary>

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'
```

```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "Jane", "email": "jane@example.com", "role": "user" }
}
```

</details>

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users/profile` | 🔑 | Current user. Returns `{ user }`. |
| `GET` | `/users` | 🛡️ | List all users (passwords are never returned). |
| `GET` | `/users/:id` | 🔑 | A user's profile (yourself, or any user as admin). |
| `PUT` | `/users/:id` | 🔑 | Update your own `name`, `email` or `password` (changing the password requires `currentPassword`). The role cannot be changed. |
| `DELETE` | `/users/:id` | 🔑 | Delete your own account, or any account as admin. The last admin cannot be deleted. |

### Playlists

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/playlists` | 🔓 | List playlists. |
| `GET` | `/playlists/:id` | 🔓 | A playlist with its populated tracks. |
| `POST` | `/playlists` | 🔑 | Create a playlist (`name`, optional `description` and `tracks`). |
| `PUT` | `/playlists/:id` | 🔑 | Update a playlist (owner or admin). |
| `DELETE` | `/playlists/:id` | 🔑 | Delete a playlist (owner or admin). |

### Tracks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/tracks` | 🔓 | List tracks. |
| `GET` | `/tracks/:id` | 🔓 | A single track. |
| `PUT` | `/tracks/:id` | 🛡️ | Update `title`, `artist` or `duration`. |
| `DELETE` | `/tracks/:id` | 🛡️ | Delete a track, its audio file and its references in playlists. |

### Upload

Tracks are created by uploading an audio file.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/upload` | 🛡️ | `multipart/form-data` with the fields `audio` (file), `title`, `artist` and `duration` (seconds). |

```bash
curl -X POST http://localhost:4000/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@song.mp3" -F "title=Song" -F "artist=Artist" -F "duration=180"
```

Accepted formats: `mp3`, `wav`, `ogg`, `flac`, `m4a`, `aac` (30 MB maximum). Files are stored as `uploads/<uuid>.<ext>` and served at `GET /uploads/<file>`.

---

## 🔐 Security

| Measure | Details |
|---|---|
| **Password storage** | bcrypt hashing, minimum 8 characters, hashes are never returned by the API |
| **Tokens** | JWT with `audience` and `issuer` checks, 5 h expiry, server refuses to start without `JWT_SECRET` |
| **Authorization** | Role checks (`admin`) and ownership checks on playlists and accounts |
| **Privilege escalation** | The signup route ignores any `role` sent by the client |
| **Rate limiting** | Login: 10 failed attempts per 15 minutes per IP. Signup: 5 accounts per hour per IP |
| **Input validation** | Type checks on bodies and IDs (blocks NoSQL injection), `400` on invalid IDs |
| **Uploads** | Audio-only filter, 30 MB limit, generated file names, invalid uploads are cleaned up |
| **HTTP hardening** | `helmet` headers, CORS restricted to `CLIENT_URL`, JSON body size limit |
| **Error handling** | Internal error details are logged, never sent to the client |

Behind a reverse proxy, add `app.set('trust proxy', 1)` in `app.js` so rate limits apply per client IP.

---

## 🧪 Testing

The API is covered by integration tests (Mocha, Chai and Supertest) that run against a **separate database** (`harmonia_test`), which is created and dropped automatically. Your real data is never touched, and the test setup refuses to run on any database whose name does not end with `_test`.

```bash
docker compose up -d mongo   # MongoDB must be running
cd server
npm test
```

What is covered:

- Auth: signup rules, role escalation attempt, login success and failures
- Users: access control, profile, updates, last-admin protection
- Playlists: ownership rules, validation, track references
- Tracks: admin-only changes, cascade cleanup on delete
- Upload: authentication, file type and metadata validation, stored path

---

## 🚢 Deployment

The project ships with Docker images for the client (built with Vite, served by Nginx) and the server. For a production deployment:

- Set a strong `JWT_SECRET`, and `CLIENT_URL` to your public frontend URL.
- Build the client image with `VITE_API_URL` set to your public API URL.
- Mount `server/uploads` as a persistent volume so audio files survive rebuilds.
- Serve both services over HTTPS behind a reverse proxy.
- Use a managed MongoDB (for example Atlas) and keep credentials out of the logs.

---

## 🗺️ Roadmap

- [x] Vite migration of the frontend
- [x] Secured API (roles, validation, rate limiting, hardened uploads)
- [x] Automated API test suite
- [ ] Global player (`PlayerContext`) so music keeps playing across pages
- [ ] Redesigned Tracks and Playlists pages with cards
- [ ] Playback features: queue, shuffle, repeat
- [ ] Admin interface for uploads
- [ ] Spotify API integration
- [ ] Continuous integration (tests on every push)

---

## 🤝 Contributing

1. Fork the repository and create a branch: `git checkout -b feature/my-feature`
2. Run `npm test` in `server/` before committing
3. Open a pull request describing the change

---

## 📄 License

Distributed under the MIT License.

---

## 📬 Contact

**Hafsa Daoudim**

- Email: hafsa.daoudim@gmail.com
- GitHub: [@Mamba1990](https://github.com/Mamba1990)
- Portfolio: https://hafsa-daoudim.gitlab.io/#hero
