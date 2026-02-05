import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n"; // Initialize i18n

// Database is now handled by Kysely (lazy connection)
// We render immediately and let the app handle async state via React Query / Zustand

// biome-ignore lint/style/noNonNullAssertion: Root element exists
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
