import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import AdminDashboard from "./features/admin/AdminDashboard";
import UserDashboard from "./features/user/UserDashboard";
import { auth } from "./config/firebaseConfig";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import VerifyMobile from "./components/Auth/VerifyMobile";
import Cart from "./pages/Cart";
import UserOrders from "./pages/UserOrders";
import { onAuthStateChanged } from "firebase/auth";

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
        const role = res.data.role;
        if (["user", "admin"].includes(role)) {
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
  return authorized ? children : <Navigate to="/userdashboard" />;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      console.log("✅ Firebase user restored:", user?.email || "none");
    });
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/verify-mobile" element={<VerifyMobile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

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
        <Route
          path="/cart"
          element={
            <ProtectedUserRoute>
              <Cart />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedUserRoute>
              <UserOrders />
            </ProtectedUserRoute>
          }
        />
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
