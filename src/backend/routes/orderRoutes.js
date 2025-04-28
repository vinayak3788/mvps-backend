// src/backend/routes/orderRoutes.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createOrder, getAllOrders, updateOrderStatus } from "../db.js";

const router = express.Router();

// Uploads path
const uploadDir = path.resolve("data/uploads");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// Submit new order
router.post("/submit-order", upload.array("files"), async (req, res) => {
  try {
    const {
      user,
      printType,
      sideOption,
      spiralBinding,
      totalCost,
      createdAt,
      pageCounts,
    } = req.body;
    const parsedPages = JSON.parse(pageCounts || "[]");

    const files = (req.files || []).map((file, i) => ({
      name: file.originalname,
      pages: parsedPages[i] || 0,
    }));

    const fileNames = files.map((f) => f.name).join(", ");
    const totalPages = files.reduce((sum, f) => sum + (f.pages || 0), 0);

    await createOrder({
      userEmail: user,
      fileNames,
      printType,
      sideOption,
      spiralBinding: spiralBinding === "true" ? 1 : 0,
      totalPages,
      totalCost,
      createdAt,
    });

    res.status(200).json({ message: "✅ Order submitted!" });
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ error: "Failed to store order." });
  }
});

// Fetch all orders
router.get("/get-orders", async (req, res) => {
  try {
    const ordersData = await getAllOrders();
    const allUploadedFiles = fs.existsSync(uploadDir)
      ? fs.readdirSync(uploadDir)
      : [];

    const ordersWithFiles = ordersData.orders.map((order) => {
      const attachedFiles = order.fileNames
        ? order.fileNames.split(", ").map((originalName) => {
            const matched = allUploadedFiles.find((f) =>
              f.endsWith(originalName.trim()),
            );
            return matched
              ? { name: originalName.trim(), path: `/uploads/${matched}` }
              : { name: originalName.trim(), path: null };
          })
        : [];

      return { ...order, attachedFiles };
    });

    res.json({ orders: ordersWithFiles });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// Update order status
router.post("/update-order-status", async (req, res) => {
  const { orderId, newStatus } = req.body;
  if (!orderId || !newStatus) {
    return res
      .status(400)
      .json({ error: "Order ID and new status are required." });
  }

  try {
    const updated = await updateOrderStatus(orderId, newStatus);
    if (!updated) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json({ message: "✅ Order status updated successfully." });
  } catch (err) {
    console.error("❌ Failed to update order status:", err);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

export default router;
