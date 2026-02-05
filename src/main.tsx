import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { getDatabase } from "./services/database/client";

const Root = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDatabase()
      .then(() => {
        console.log("🚀 Database initialized successfully");
        setIsDbReady(true);
      })
      .catch((err) => {
        console.error("❌ Failed to initialize database:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "#ef4444", fontFamily: "system-ui" }}>
        <h1>Database Error</h1>
        <p>Failed to initialize the local database.</p>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        color: "#6b7280"
      }}>
        Loading Database...
      </div>
    );
  }

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
