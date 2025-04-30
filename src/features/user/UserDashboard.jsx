import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "../../config/firebaseConfig";

import UploadOrderForm from "./components/UploadOrderForm";
import OrdersHistory from "./components/OrdersHistory";
import { useOrders } from "./components/useOrders";
import { useAuthCheck } from "./components/useAuthCheck";
import StationeryStore from "./components/StationeryStore";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(true);
  const { files, setFiles, myOrders, fetchMyOrders, ordersLoading } =
    useOrders();
  const { validateMobile } = useAuthCheck();
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("No user logged in.");
        navigate("/login");
      } else {
        console.log("✅ Firebase User restored:", user.email);
        await validateMobile(user.email);
        setPending(false);
        fetchMyOrders(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("User not logged in.");
      return;
    }

    try {
      await user.getIdToken(true);
      const res = await axios.get(`/api/get-role?email=${user.email}`);
      const role = res.data.role;

      if (role === "admin" || user.email === "vinayak3788@gmail.com") {
        navigate("/admin");
      } else {
        toast.error("Access denied. You are not an admin.");
      }
    } catch (err) {
      console.error("Admin access check failed", err);
      toast.error("Could not verify role. Try again.");
    }
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  if (pending) {
    return <div className="text-center mt-10">Checking login...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Toaster />

      {/* Topbar */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🖨️ MVPS Dashboard
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleViewCart}
            className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
          >
            🛕️ View Cart
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "orders"
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 border"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          📄 My Orders
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "stationery"
              ? "bg-green-500 text-white"
              : "bg-white text-green-500 border"
          }`}
          onClick={() => setActiveTab("stationery")}
        >
          🛒 Stationery Store
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" ? (
        <>
          <UploadOrderForm
            files={files}
            setFiles={setFiles}
            fetchMyOrders={fetchMyOrders}
          />

          <OrdersHistory myOrders={myOrders} ordersLoading={ordersLoading} />

          {/* Admin Access Button */}
          <div className="mt-10 text-center">
            <button
              onClick={handleAdminAccess}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              🔐 Switch to Admin Dashboard
            </button>
          </div>
        </>
      ) : (
        <StationeryStore />
      )}
    </div>
  );
}
