//src/features/user/components/useOrders.js

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function useOrders() {
  const [files, setFiles] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchMyOrders = async (email) => {
    try {
      const res = await axios.get("/api/get-orders");
      const allOrders = res.data.orders || [];
      const userOrders = allOrders.filter((order) => order.userEmail === email);
      setMyOrders(userOrders);
    } catch (err) {
      console.error("❌ Error fetching orders", err);
      toast.error("Failed to fetch your orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  return { files, setFiles, myOrders, fetchMyOrders, ordersLoading };
}
