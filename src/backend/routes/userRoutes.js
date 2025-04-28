// src/backend/routes/userRoutes.js

import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import {
  ensureUserRole,
  updateUserRole,
  getUserRole,
  blockUser,
  unblockUser,
  deleteUser,
} from "../db.js";
import path from "path";

const router = express.Router();

// Role management APIs

router.post("/update-role", async (req, res) => {
  const { email, role } = req.body;
  try {
    await updateUserRole(email, role);
    res.json({ message: `Role updated to ${role}` });
  } catch (err) {
    console.error("❌ Failed to update role:", err);
    res.status(500).json({ error: "Could not update role" });
  }
});

router.get("/get-role", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const role = await getUserRole(email);
    res.json({ role });
  } catch (err) {
    console.error("❌ Failed to get user role:", err);
    res.status(500).json({ error: "Could not get user role" });
  }
});

// List all users
router.get("/get-users", async (req, res) => {
  try {
    const db = await open({
      filename: path.resolve("data/orders.db"),
      driver: sqlite3.Database,
    });

    const users = await db.all(`
      SELECT u.email, u.role, p.mobileNumber, u.blocked
      FROM users u
      LEFT JOIN profiles p ON u.email = p.email
      ORDER BY u.email
    `);

    res.json({ users });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Block user
router.post("/block-user", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    await blockUser(email);
    res.json({ message: "✅ User blocked successfully." });
  } catch (err) {
    console.error("❌ Failed to block user:", err);
    res.status(500).json({ error: "Failed to block user." });
  }
});

// Unblock user
router.post("/unblock-user", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    await unblockUser(email);
    res.json({ message: "✅ User unblocked successfully." });
  } catch (err) {
    console.error("❌ Failed to unblock user:", err);
    res.status(500).json({ error: "Failed to unblock user." });
  }
});

// Delete user
router.post("/delete-user", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    await deleteUser(email);
    res.json({ message: "✅ User deleted successfully." });
  } catch (err) {
    console.error("❌ Failed to delete user:", err);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// Update user profile (mobile, first name, last name, mobileVerified)
router.post("/update-profile", async (req, res) => {
  const { email, mobileNumber, firstName, lastName, mobileVerified } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const db = await open({
      filename: path.resolve("data/orders.db"),
      driver: sqlite3.Database,
    });

    const existingProfile = await db.get(
      `SELECT * FROM profiles WHERE email = ?`,
      [email],
    );

    if (existingProfile) {
      await db.run(
        `UPDATE profiles SET 
          mobileNumber = ?, 
          firstName = ?, 
          lastName = ?, 
          mobileVerified = COALESCE(?, mobileVerified)
         WHERE email = ?`,
        [
          mobileNumber || existingProfile.mobileNumber,
          firstName || existingProfile.firstName,
          lastName || existingProfile.lastName,
          mobileVerified ?? existingProfile.mobileVerified,
          email,
        ],
      );
    } else {
      await db.run(
        `INSERT INTO profiles (email, mobileNumber, firstName, lastName, mobileVerified) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          email,
          mobileNumber || "",
          firstName || "",
          lastName || "",
          mobileVerified ?? 0,
        ],
      );
    }

    res.json({ message: "✅ Profile updated successfully!" });
  } catch (err) {
    console.error("❌ Failed to update profile:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
