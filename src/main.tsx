import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";

// Debug options
const params = new URLSearchParams(window.location.search);
if (params.get("reset_passordr")) {
  if (confirm("Are you sure to clear storage ?")) {
    localStorage.clear();
    params.delete("reset_passordr");
    window.location.search = params.toString();
  }
}

// Render React
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
