// src/features/admin/components/Sidebar.jsx

import React from "react";

const Sidebar = ({
  activeTab,
  setActiveTab,
  fetchOrders,
  fetchUsers,
  handleLogout,
  handleSwitchToUserDashboard,
}) => {
  const baseBtn =
    "py-2 px-4 text-sm font-medium rounded-md transition whitespace-nowrap shadow-sm";

  const activeStyles = "bg-blue-600 text-white";
  const inactiveStyles = "hover:bg-blue-100 text-gray-800";

  return (
    <div className="w-full max-w-full sm:max-w-xs bg-white p-4 shadow-md flex flex-col gap-4 sm:min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-2">Admin Panel</h2>

      <div className="flex flex-wrap gap-2 sm:flex-col justify-center">
        <button
          className={`${baseBtn} ${
            activeTab === "orders" ? activeStyles : inactiveStyles
          }`}
          onClick={() => {
            setActiveTab("orders");
            fetchOrders();
          }}
        >
          📦 Manage Orders
        </button>

        <button
          className={`${baseBtn} ${
            activeTab === "users" ? activeStyles : inactiveStyles
          }`}
          onClick={() => {
            setActiveTab("users");
            fetchUsers();
          }}
        >
          👤 Manage Users
        </button>

        <button
          className={`${baseBtn} ${
            activeTab === "stationery" ? activeStyles : inactiveStyles
          }`}
          onClick={() => setActiveTab("stationery")}
        >
          🖋️ Manage Stationery
        </button>
      </div>

      <div className="mt-4 sm:mt-auto flex flex-wrap sm:flex-col gap-2 justify-center">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          onClick={handleSwitchToUserDashboard}
        >
          Switch to User Dashboard
        </button>

        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
