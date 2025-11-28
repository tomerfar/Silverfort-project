import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // סטייט (מצב) לאחסון הנתונים מהשרת
  const [data, setData] = useState([]);
  // סטייט לאחסון הודעת שגיאה
  const [error, setError] = useState(null);

  useEffect(() => {
    // הפונקציה לקריאה ל-API
    const fetchData = async () => {
      try {
        // הכתובת הזו תפנה לשרת ה-Express שלנו בפורט 3001
        const response = await axios.get("http://localhost:3001/api/data");
        setData(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to fetch data from the server. Is the server running?"
        );
      }
    };

    fetchData();
  }, []); // ריצה פעם אחת לאחר הטעינה הראשונית

  return (
    <div className="App">
      <header className="App-header">
        <h1>Silverfort Junior Challenge - Client</h1>
        <p>
          Status: {error ? "❌ Server Error" : "✅ Connected to Server Mock"}
        </p>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <h2>Mock Data from Server:</h2>
        {/* מציגים את הנתונים אם יש */}
        <ul>
          {data.length > 0 ? (
            data.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>: {item.status}
              </li>
            ))
          ) : (
            <li>Loading data...</li>
          )}
        </ul>
      </header>
    </div>
  );
}

export default App;
