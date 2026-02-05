import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { getDatabase } from "./services/database/client";

// Initialize database before rendering app
getDatabase()
  .then(() => {
    console.log("🚀 Database initialized successfully");

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("❌ Failed to initialize database:", error);
    document.body.innerHTML = `
      <div style="padding: 2rem; color: #ef4444; font-family: system-ui;">
        <h1>Database Error</h1>
        <p>Failed to initialize the local database.</p>
        <pre>${error.message}</pre>
      </div>
    `;
  });
