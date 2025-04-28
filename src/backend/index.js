// src/backend/index.js

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import otpRoutes from "./routes/otpRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static folders
const uploadDir = path.resolve(__dirname, "../../data/uploads");
const distPath = path.resolve(__dirname, "../../dist");

// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https://*.replit.dev https://*.firebaseapp.com https://*.googleapis.com https://*.gstatic.com https://apis.google.com; " +
      "script-src 'self' 'unsafe-inline' https://*.replit.dev https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' ws: https://*.replit.dev https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com; " +
      "frame-src 'self' https://*.replit.dev https://*.firebaseapp.com https://accounts.google.com;",
  );
  next();
});

// 🛣️ Mount Routes
app.use("/api", otpRoutes);
app.use("/api", orderRoutes);
app.use("/api", userRoutes);

// Static serving
app.use(express.static(distPath));
app.use("/uploads", express.static(uploadDir));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Express API running at http://localhost:${PORT}`);
});
