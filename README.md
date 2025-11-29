Silverfort – Multi-Session Real-Time Web Game

A full-stack TypeScript solution for the Silverfort challenge.

This project implements a multi-session, real-time, interactive web game using Node.js, React, TypeScript, and Socket.IO.
The architecture ensures all players share a synchronized game state and interact in real time across multiple sessions.

Implemented Requirements
Multi-Session Support

Full real-time synchronization across all connected clients using Socket.IO.

All players see the exact same game state (grid, score, cooldown, etc.) at every moment.

Core Game Logic

Valid move checking and full rule validation.

Generation of an initial valid board.

Mandatory shape/color change on every click.

Cooldown Mechanic

A 3-turn cooldown implemented server-side (Single Source of Truth).

Updated instantly on the client through socket events.

Game Over Condition

Game ends when a player attempts a move and no valid new shape/color combination exists.

How to Run the Project
Follow these steps to run both the server and the client.

1. Install Dependencies

Run these commands from the project root:

# Install server dependencies

cd server
npm install

# Install client dependencies

cd ../client
npm install

2. Start the Server

In a first terminal window:
cd server
npm start

The backend will run at:
http://localhost:3001

3. Start the Client

In a second terminal window:
cd client
npm start

The frontend will open at:
http://localhost:3000

4. Test Multi-Session Behavior

Open multiple tabs or devices at:
http://localhost:3000
