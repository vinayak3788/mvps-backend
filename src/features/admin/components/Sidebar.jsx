// src/features/admin/components/Sidebar.jsx

import React from "react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  fetchOrders,
  fetchUsers,
  handleLogout,
  handleSwitchToUserDashboard,
}) {
  return (
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
          className="bg-gray-800 text-white py-1 rounded hover:bg-gray-900"
        >
          User Dashboard
        </button>
      </div>
    </div>
  );
}
