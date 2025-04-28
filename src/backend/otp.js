// src/backend/otp.js

import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY; // ✅ Corrected

if (!TWOFACTOR_API_KEY) {
  throw new Error("❌ TWOFACTOR_API_KEY not found in environment variables.");
}

// Send OTP
router.post("/api/send-otp", async (req, res) => {
  const { mobileNumber } = req.body; // ✅ Corrected to match frontend

  if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
    return res
      .status(400)
      .json({ error: "Valid 10-digit mobile number required." });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/+91${mobileNumber}/AUTOGEN`,
    );

    if (response.data.Status === "Success") {
      res.json({ success: true, sessionId: response.data.Details });
    } else {
      throw new Error(response.data.Details || "Failed to send OTP");
    }
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

// Verify OTP
router.post("/api/verify-otp", async (req, res) => {
  const { sessionId, otpCode } = req.body; // ✅ Corrected to use sessionId, otpCode

  if (!sessionId || !otpCode) {
    return res.status(400).json({ error: "Session ID and OTP are required." });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otpCode}`,
    );

    if (response.data.Details === "OTP Matched") {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error("❌ Error verifying OTP:", err.message);
    res.status(500).json({ error: "Failed to verify OTP." });
  }
});

export default router;
