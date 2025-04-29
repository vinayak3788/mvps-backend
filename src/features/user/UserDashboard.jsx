import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "../../config/firebaseConfig";

import UploadOrderForm from "./components/UploadOrderForm";
import OrdersHistory from "./components/OrdersHistory";
import { useOrders } from "./components/useOrders";
import { useAuthCheck } from "./components/useAuthCheck";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(true);
  const { files, setFiles, myOrders, fetchMyOrders, ordersLoading } =
    useOrders();
  const { validateMobile } = useAuthCheck();

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

  if (pending) {
    return <div className="text-center mt-10">Checking login...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🖨️ MVPS Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Upload Section */}
      <UploadOrderForm
        files={files}
        setFiles={setFiles}
        fetchMyOrders={fetchMyOrders}
      />

      {/* Orders History Section */}
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
    </div>
  );
}
