import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import "./App.css";

/**
 * Main App Component with Routing
 * The previous App is transfered to Dashboard.jsx
 * Routes:
 * - /login - Login page
 * - /signup - Signup page
 * - / - Dashboard (main schedule management interface)
 * - /dashboard - Dashboard (redirects to /)
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Main Dashboard Route */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        
        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
*/