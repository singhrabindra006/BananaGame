# 🍌 BananaQuiz Game

An interactive, responsive full-stack math puzzle web application powered by **React 19**, **Node.js/Express**, **MongoDB**, and **Marc Conrad's Banana API** (University of Bedfordshire).

---

## 🌟 Core Conceptual Themes

1. **Virtual Identity**:
   - Secure user registration and authentication with bcrypt password encryption.
   - Persistent token-based virtual identities stored in MongoDB.
   - Session restoration via `js-cookie` (`sameSite: "strict"`).
   - Profile management with custom avatar selection and password change.
2. **Interoperability**:
   - Seamless connection to a custom backend REST API running on port `5000` backed by MongoDB.
   - Live integration with external third-party PHP REST service: [Banana API](https://marcconrad.com/uob/banana/api.php).
   - AbortController signal handling for clean cancellation and data structure normalization.
3. **Event-Driven Programming**:
   - React lifecycle synchronization hooks (`useEffect`, `useState`, `useCallback`).
   - Dynamic event logging (`logEvent`) tracing login, puzzle fetch, answer verification, and quiz completions.
   - Real-time Web Audio API synthesized feedback on user clicks, correct/incorrect submissions, and victory fanfares.

---

## 🚀 Key Features

* **🎮 Interactive Quiz Gameplay**:
  * 10-puzzle rounds with dynamic progress tracking.
  * **Touch-Friendly 0–9 Keypad**: Tap numbers directly on mobile or use keyboard shortcuts (0-9 + Enter) on desktop.
  * **⏱️ Speed Run Challenge Mode**: Optional 20-second countdown timer per puzzle.
  * **🔥 Streak & Combo System**: Tracks consecutive correct answers with visual combo badges and max streak stats.
  * **🎉 Celebratory Confetti & Audio**: Synthesized sound effects (Web Audio API) and festive confetti for high scorers.
* **🏆 Hall of Fame Leaderboard**:
  * **Olympic 3D-Tiered Podium**: Elevated 1st Place (🥇), 2nd Place (🥈), and 3rd Place (🥉) pedestals.
  * **Player Rank Tiers**: 👑 Grand Master (10/10), 🐒 Clever Monkey (8-9), 🌴 Adventurer (5-7), 🌱 Sprout (1-4).
  * **Real-Time Search & Sorting**: Search by username and sort by High Score, Games Played, Flawless 10/10s, or Recent.
  * **Share Your Rank**: One-click score challenge copy to clipboard.
  * **Player Details Modal**: Inspect lifetime stats, games played, total bananas, and last active date.
* **👤 User Profile & Account**:
  * Display avatar picker (🍌, 🐒, 🦍, 🌴, 👑, 🚀, ⭐, 🏆).
  * Career statistics overview.
  * Secure password change form.
* **📱 Fully Responsive Design**:
  * Fluid design optimized across desktop, tablet, and mobile down to 320px.
  * Sticky frosted glass navigation with mobile hamburger menu.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, React Router v7, Axios, js-cookie, Oxlint
* **Backend**: Node.js, Express 5, Mongoose 9, MongoDB, bcryptjs, cors, dotenv
* **External Service**: Marc Conrad Banana Puzzle API (`https://marcconrad.com/uob/banana/api.php`)
* **Audio**: Web Audio API (Hardware Synthesizer)

---

## 📋 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure MongoDB is running locally on mongodb://127.0.0.1:27017/bananaQuizDB
npm run dev
```
The backend server will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new player account (min 3 chars username, 6 chars pw) |
| `POST` | `/api/auth/login` | No | Authenticate user and issue session token |
| `GET` | `/api/auth/me` | Bearer Token | Fetch authenticated user profile and stats |
| `PUT` | `/api/auth/password` | Bearer Token | Change user password |
| `PUT` | `/api/auth/avatar` | Bearer Token | Update user avatar emoji |
| `POST` | `/api/auth/logout` | Bearer Token | Invalidate session token on server |
| `POST` | `/api/auth/score` | Optional Bearer | Save quiz score and update high score, games played, total points |
| `GET` | `/api/auth/scores` | No | Get leaderboard and global statistics (`?sortBy=score\|games\|perfect\|recent`) |
| `GET` | `/api/health` | No | Server health check, uptime, and system status |

---

## 🧪 Testing & Linting

```bash
# Run backend unit tests
npm --prefix backend run test

# Run frontend build
npm --prefix frontend run build

# Run frontend linter
npm --prefix frontend run lint
```

---

## 📄 License
ISC License. Educational project for University of Bedfordshire coursework.

