// src/features/admin/AdminDashboard.jsx

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
} from "../../api/userApi"; // 🆕 Updated API helpers
import toast, { Toaster } from "react-hot-toast";
import FileLinks from "../../components/FileLinks";
import axios from "axios";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("No user logged in.");
        navigate("/login");
      } else {
        console.log("✅ Firebase User restored:", user.email);
        const success = await validateRole();
        if (success) {
          await fetchOrders();
          setPending(false);
        }
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
        toast.error("You are not admin. Redirecting to User Dashboard!");
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
    if (email === "vinayak3788@gmail.com") {
      toast.error("❌ Cannot change main admin.");
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
    try {
      await updateProfile(editUser.email, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        mobileNumber: editUser.mobileNumber,
      });
      toast.success("Profile updated");
      setEditUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("❌ Failed to update profile:", err);
      toast.error("Failed to update profile");
    }
  };

  if (pending) {
    return <div className="text-center mt-10">Checking login...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster />

      {/* Sidebar */}
      <div className="w-48 bg-white shadow-md p-4 flex flex-col gap-4">
        <button
          onClick={() => {
            setActiveTab("orders");
            fetchOrders();
          }}
          className={`px-4 py-2 rounded ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Manage Orders
        </button>

        <button
          onClick={() => {
            setActiveTab("users");
            fetchUsers();
          }}
          className={`px-4 py-2 rounded ${
            activeTab === "users"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Manage Users
        </button>

        <div className="mt-10 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>

          <button
            onClick={handleSwitchToUserDashboard}
            className="bg-black text-white py-1 rounded hover:bg-gray-800"
          >
            User Dashboard
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-6 overflow-x-auto">
        {activeTab === "orders" ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">
              Admin - Manage Orders
            </h1>
            {loading ? (
              <div className="text-center p-4">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center">No orders found.</div>
            ) : (
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th>Order No</th>
                    <th>User Email</th>
                    <th>Files</th>
                    <th>Pages</th>
                    <th>Options</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="text-center">
                      <td>{order.orderNumber}</td>
                      <td>{order.userEmail}</td>
                      <td>
                        <FileLinks files={order.attachedFiles} />
                      </td>
                      <td>{order.totalPages || "-"}</td>
                      <td>
                        {order.printType?.toUpperCase()} |{" "}
                        {order.sideOption?.toUpperCase()}{" "}
                        {order.spiralBinding ? "| Spiral" : ""}
                      </td>
                      <td>₹{order.totalCost}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="border rounded p-1 text-sm"
                        >
                          <option value="new">🟡 New</option>
                          <option value="in process">🟠 In Process</option>
                          <option value="ready to deliver">🟢 Ready</option>
                        </select>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">
              Admin - Manage Users
            </h1>
            {loading ? (
              <div className="text-center p-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center">No users found.</div>
            ) : (
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th>Email</th>
                    <th>Role</th>
                    <th>Mobile</th>
                    <th>Blocked</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email} className="text-center">
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.mobileNumber || "-"}</td>
                      <td>{user.blocked ? "Yes" : "No"}</td>
                      <td className="space-x-1">
                        <button
                          onClick={() =>
                            handleRoleChange(
                              user.email,
                              user.role === "admin" ? "user" : "admin",
                            )
                          }
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          {user.role === "admin" ? "Make User" : "Make Admin"}
                        </button>
                        <button
                          onClick={() => setEditUser(user)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                        {user.blocked ? (
                          <button
                            onClick={() => handleUnblockUser(user.email)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(user.email)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Block
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {editUser && (
              <div className="fixed top-10 right-10 bg-white p-4 shadow rounded-lg w-80 space-y-2">
                <h2 className="font-bold text-lg">Edit User</h2>
                <input
                  type="text"
                  value={editUser.firstName || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, firstName: e.target.value })
                  }
                  placeholder="First Name"
                  className="w-full border p-2 rounded"
                />
                <input
                  type="text"
                  value={editUser.lastName || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, lastName: e.target.value })
                  }
                  placeholder="Last Name"
                  className="w-full border p-2 rounded"
                />
                <input
                  type="text"
                  value={editUser.mobileNumber || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, mobileNumber: e.target.value })
                  }
                  placeholder="Mobile Number"
                  className="w-full border p-2 rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditUser}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditUser(null)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
