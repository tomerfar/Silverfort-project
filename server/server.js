const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(express.json());
app.use(cors()); // מאפשר ל-React לתקשר עם השרת

// --- Mock Data ---
const mockData = [
  { id: 1, name: "Policy 1: Access Control", status: "Active" },
  { id: 2, name: "Policy 2: MFA Enforcement", status: "Disabled" },
  { id: 3, name: "Policy 3: VPN Tunneling", status: "Active" },
];

// --- Endpoints ---
// GET: מקבל את רשימת הנתונים
app.get("/api/data", (req, res) => {
  res.json(mockData);
});

// --- הפעלת השרת ---
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
