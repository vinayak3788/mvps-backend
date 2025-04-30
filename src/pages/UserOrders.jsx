// src/pages/UserOrders.jsx

import React from "react";
//import useOrders from "../features/user/components/useOrders";
import { useOrders } from "../features/user/components/useOrders";

export default function UserOrders() {
  const { orders, loading } = useOrders();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">📦 My Orders</h2>
      {loading ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="bg-white shadow p-4 rounded">
              <p>
                <b>Order No:</b> {order.orderNumber}
              </p>
              <p>
                <b>Total:</b> ₹{order.totalCost}
              </p>
              <p>
                <b>Status:</b> {order.status || "New"}
              </p>
              {order.attachedFiles?.length > 0 && (
                <div className="mt-2">
                  <b>Files:</b>
                  <ul className="list-disc ml-5 text-sm">
                    {order.attachedFiles.map((f, i) => (
                      <li key={i}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
