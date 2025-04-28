// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import AdminDashboard from "./features/admin/AdminDashboard";
import UserDashboard from "./features/user/UserDashboard";
import { auth } from "./config/firebaseConfig";
import axios from "axios";
import { Toaster } from "react-hot-toast";

import VerifyMobile from "./components/Auth/VerifyMobile"; // ✅ Import this

function ProtectedUserRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        setAuthorized(false);
        return;
      }
      try {
        const res = await axios.get(`/api/get-role?email=${user.email}`);
        if (res.data.role === "user") {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (err) {
        console.error(err);
        setAuthorized(false);
      }
    };
    checkRole();
  }, [location.pathname]);

  if (authorized === null) {
    return <div className="text-center mt-10">Checking access...</div>;
  }
  return authorized ? children : <Navigate to="/login" />;
}

function ProtectedAdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        setAuthorized(false);
        return;
      }
      try {
        const res = await axios.get(`/api/get-role?email=${user.email}`);
        if (res.data.role === "admin") {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (err) {
        console.error(err);
        setAuthorized(false);
      }
    };
    checkRole();
  }, [location.pathname]);

  if (authorized === null) {
    return <div className="text-center mt-10">Checking access...</div>;
  }
  return authorized ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/verify-mobile" element={<VerifyMobile />} />
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Protected Routes */}
        <Route
          path="/userdashboard"
          element={
            <ProtectedUserRoute>
              <UserDashboard />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="text-center text-red-500 mt-10">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
}
