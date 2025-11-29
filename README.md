Silverfors the required Multi-Session, Real-Time Web Game challenge using a Full Stack TypeScript architecture.

Implemented Requirements

Requirement

Implementation Details

Technology Stack

Node.js (Express), TypeScript, React, Socket.IO. # t Tech Exam - Junior Full Stack Engineer (Multi-Session Game) This project implement

Multi-Session

Full synchronization using Socket.IO ensures all connected clients see the exact same game state (Grid, Score, Cooldown) in real-time.

Core Logic

Implemented game validation rules, initial valid board generation, and mandatory shape/color change on click.

Cooldown

Cooldown of 3 turns is handled on the server (Single Source of Truth) and reflected in the UI.

Game Over

Game ends when a player attempts a click but no valid new shape/color combination exists.

Bonus 1 (Leaderboard)

Implemented. High scores are saved to a leaderboard.json file on the server (Persistence) and fetched via a separate REST API call.

Best Practices

Clear separation of concerns (Client/Server), use of TypeScript Interfaces, and clean Git history (when submitting).

🚀 Getting Started

Prerequisites: Node.js (v18+), npm/yarn.

1. Installation

Install dependencies separately for the Server and Client:

# In the root directory (silverfort-project):

cd server
npm install
cd ../client
npm install

2. Running the Application

You must run the Server and Client in separate terminal windows.

Component

Directory

Command

URL

Backend (Server)

server/

npm start

Runs on http://localhost:3001

Frontend (Client)

client/

npm start

Opens http://localhost:3000

3. Verification

To verify multi-session synchronization, open http://localhost:3000 in multiple browser tabs or devices. All actions will be reflected instantly across all sessions.
