// src/features/admin/components/OrdersTable.jsx

import React from "react";
import FileLinks from "/src/components/FileLinks"; // ✅ Correct absolute path

export default function OrdersTable({ orders, loading, handleStatusChange }) {
  if (loading) {
    return <div className="text-center p-4">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center">No orders found.</div>;
  }

  return (
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
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
  );
}
