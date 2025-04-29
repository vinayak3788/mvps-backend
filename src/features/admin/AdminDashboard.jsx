// src/features/admin/AdminDashboard.jsx

import { verifyMobileManual } from "../../api/userApi";
import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../api/orderApi";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  blockUser,
  unblockUser,
  updateProfile,
} from "../../api/userApi";
import Sidebar from "./components/Sidebar";
import OrdersTable from "./components/OrdersTable";
import UsersTable from "./components/UsersTable";
import EditUserModal from "./components/EditUserModal";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const handleVerifyMobile = async (email) => {
    try {
      await verifyMobileManual(email);
      toast.success("Mobile verification updated");
      await fetchUsers(); // Refresh users
    } catch (err) {
      console.error("❌ Failed to verify mobile:", err);
      toast.error("Failed to verify mobile.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("No user logged in.");
        navigate("/login");
      } else {
        console.log("✅ Firebase User restored:", user.email);
        const roleCheck = await validateRole();
        if (roleCheck) {
          await fetchOrders();
        }
        setPending(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const validateRole = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("No user logged in.");
      navigate("/login");
      return false;
    }
    try {
      const res = await axios.get(`/api/get-role?email=${user.email}`);
      const role = res.data.role;
      if (role !== "admin") {
        // Allow even admin to access user dashboard if needed
        toast.success("Redirecting to User Dashboard!");
        setTimeout(() => navigate("/userdashboard"), 1500);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Role check failed", err);
      toast.error("Error validating user role. Please login again.");
      navigate("/login");
      return false;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSwitchToUserDashboard = () => {
    navigate("/userdashboard");
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders();
      setOrders(Array.isArray(response.orders) ? response.orders : []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(Array.isArray(response.users) ? response.users : []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Status updated");
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleRoleChange = async (email, newRole) => {
    if (email === "vinayak3788@gmail.com" && newRole !== "admin") {
      toast.error("❌ Cannot change Super Admin role.");
      return;
    }
    try {
      await updateUserRole(email, newRole);
      toast.success("Role updated");
      await fetchUsers();
    } catch (err) {
      console.error("❌ Failed to update role:", err);
      toast.error("Failed to update role");
    }
  };

  const handleBlockUser = async (email) => {
    if (email === "vinayak3788@gmail.com") {
      toast.error("❌ Cannot block main admin.");
      return;
    }
    try {
      await blockUser(email);
      toast.success("User blocked");
      await fetchUsers();
    } catch (err) {
      console.error("❌ Failed to block user:", err);
      toast.error("Failed to block user");
    }
  };

  const handleUnblockUser = async (email) => {
    try {
      await unblockUser(email);
      toast.success("User unblocked");
      await fetchUsers();
    } catch (err) {
      console.error("❌ Failed to unblock user:", err);
      toast.error("Failed to unblock user");
    }
  };

  const handleDeleteUser = async (email) => {
    if (email === "vinayak3788@gmail.com") {
      toast.error("❌ Cannot delete main admin.");
      return;
    }
    try {
      await deleteUser(email);
      toast.success("User deleted");
      await fetchUsers();
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
      toast.error("Failed to delete user");
    }
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateProfile(editUser.email, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        mobileNumber: editUser.mobileNumber,
        mobileVerified: editUser.mobileVerified ? 1 : 0,
      });
      toast.success("Profile updated");
      setEditUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("❌ Failed to update profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (pending) {
    return <div className="text-center mt-10">Checking login...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fetchOrders={fetchOrders}
        fetchUsers={fetchUsers}
        handleLogout={handleLogout}
        handleSwitchToUserDashboard={handleSwitchToUserDashboard}
      />

      <div className="flex-1 p-6 overflow-x-auto">
        {activeTab === "orders" ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">
              Admin - Manage Orders
            </h1>
            <OrdersTable
              orders={orders}
              loading={loading}
              handleStatusChange={handleStatusChange}
            />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">
              Admin - Manage Users
            </h1>
            <UsersTable
              users={users}
              loading={loading}
              handleRoleChange={handleRoleChange}
              handleBlockUser={handleBlockUser}
              handleUnblockUser={handleUnblockUser}
              handleDeleteUser={handleDeleteUser}
              handleVerifyMobile={handleVerifyMobile}
              setEditUser={setEditUser}
            />
            <EditUserModal
              editUser={editUser}
              setEditUser={setEditUser}
              handleEditUser={handleEditUser}
              saving={saving}
            />
          </>
        )}
      </div>
    </div>
  );
}
