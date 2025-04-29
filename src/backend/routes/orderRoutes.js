import { getSignedUrl } from "../../config/s3Uploader.js";

import express from "express";
import multer from "multer";
import {
  createOrder,
  updateOrderFiles,
  getAllOrders,
  updateOrderStatus,
} from "../db.js";
import { uploadFileToS3 } from "../../config/s3Uploader.js";
import path from "path";

const router = express.Router();

// Multer setup (memory storage because we upload directly to S3)
const upload = multer({ storage: multer.memoryStorage() });

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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const parsedPages = JSON.parse(pageCounts || "[]");

    const newOrder = await createOrder({
      userEmail: user,
      fileNames: "",
      printType,
      sideOption,
      spiralBinding: spiralBinding === "true" ? 1 : 0,
      totalPages: 0,
      totalCost,
      createdAt,
      orderNumber: "",
    });

    const orderId = newOrder.id;
    const orderNumber = `Order${orderId}`;

    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const { cleanFileName } = await uploadFileToS3(
        file.buffer,
        file.originalname,
        orderNumber,
      );
      uploadedFiles.push({
        name: cleanFileName,
        pages: parsedPages[i] || 0,
      });
    }

    const fileNames = uploadedFiles.map((f) => f.name).join(", ");
    const totalPages = uploadedFiles.reduce(
      (sum, f) => sum + (f.pages || 0),
      0,
    );

    await updateOrderFiles(orderId, {
      fileNames,
      totalPages,
      orderNumber,
    });

    res.status(200).json({ message: "✅ Order submitted!" });
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ error: "Failed to store order." });
  }
});

// Get signed download URL
router.get("/get-signed-url", async (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ error: "Filename required" });
  }
  try {
    const url = await getSignedUrl(filename);
    res.json({ url });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

// Fetch all orders
router.get("/get-orders", async (req, res) => {
  try {
    const ordersData = await getAllOrders();

    const ordersWithFiles = ordersData.orders.map((order) => {
      const attachedFiles = order.fileNames
        ? order.fileNames.split(", ").map((name) => ({
            name: name.trim(), // Only name — no static path anymore
          }))
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
