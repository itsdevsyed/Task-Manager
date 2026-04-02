import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Ensure this file exists in the same folder!
import AppRouter from "./app/router";
import React from "react";
import { AuthProvider } from "./context/AuthContext";

// If you want to see the Buttons in App.tsx instead of the Router,
// change <AppRouter /> to <App /> below.

createRoot(document.getElementById('root')!).render(
<React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
)
