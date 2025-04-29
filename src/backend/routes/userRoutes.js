// src/backend/routes/userRoutes.js

import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import {
  updateUserRole,
  getUserRole,
  blockUser,
  unblockUser,
  deleteUser,
  initDb,
  ensureUserRole,
} from "../db.js";

const router = express.Router();

// Role management APIs

router.post("/update-role", async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required." });
  }

  try {
    if (email === "vinayak3788@gmail.com" && role !== "admin") {
      return res
        .status(403)
        .json({ error: "❌ Cannot change super admin role." });
    }

    await updateUserRole(email, role);
    res.json({ message: `✅ Role updated to ${role}` });
  } catch (err) {
    console.error("❌ Failed to update role:", err);
    res.status(500).json({ error: "Could not update role." });
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
      SELECT 
        u.email, 
        u.role, 
        u.blocked, 
        p.mobileNumber, 
        p.firstName, 
        p.lastName, 
        p.mobileVerified
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

    const verifiedFlag =
      typeof mobileVerified === "boolean"
        ? mobileVerified
          ? 1
          : 0
        : typeof mobileVerified === "number"
          ? mobileVerified
          : 0;

    if (existingProfile) {
      await db.run(
        `UPDATE profiles SET 
          mobileNumber = ?, 
          firstName = ?, 
          lastName = ?, 
          mobileVerified = ?
         WHERE email = ?`,
        [
          mobileNumber ?? existingProfile.mobileNumber,
          firstName ?? existingProfile.firstName,
          lastName ?? existingProfile.lastName,
          verifiedFlag,
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
          verifiedFlag,
        ],
      );
    }

    res.json({ message: "✅ Profile updated successfully!" });
  } catch (err) {
    console.error("❌ Failed to update profile:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ✅ Fetch profile details by email
router.get("/get-profile", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const db = await open({
      filename: path.resolve("data/orders.db"),
      driver: sqlite3.Database,
    });

    const profile = await db.get(`SELECT * FROM profiles WHERE email = ?`, [
      email,
    ]);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("❌ Failed to fetch profile:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ✅ Manual toggle mobile verified from Admin
router.post("/verify-mobile-manual", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const db = await open({
      filename: path.resolve("data/orders.db"),
      driver: sqlite3.Database,
    });

    const profile = await db.get(`SELECT * FROM profiles WHERE email = ?`, [
      email,
    ]);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newFlag = profile.mobileVerified ? 0 : 1;

    await db.run(`UPDATE profiles SET mobileVerified = ? WHERE email = ?`, [
      newFlag,
      email,
    ]);

    res.json({ message: "✅ Mobile verification status updated!" });
  } catch (err) {
    console.error("❌ Failed to toggle mobile verification:", err.message);
    res.status(500).json({ error: "Failed to toggle mobile verification." });
  }
});

// ✅ Create new user and profile after signup
router.post("/create-user-profile", async (req, res) => {
  const { email, firstName, lastName, mobileNumber } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const db = await initDb();

    // Ensure user is added to users table
    await ensureUserRole(email);

    // Add/update profile info
    await db.run(
      `INSERT OR REPLACE INTO profiles (email, firstName, lastName, mobileNumber) VALUES (?, ?, ?, ?)`,
      [email, firstName, lastName, mobileNumber],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to create user profile:", err);
    res.status(500).json({ error: "Failed to create profile" });
  }
});

export default router;
