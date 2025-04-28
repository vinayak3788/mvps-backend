// src/components/Auth/VerifyMobile.jsx

import React, { useState } from "react";
import { auth } from "../../config/firebaseConfig";
import { sendOtp, verifyOtp } from "../../api/otpApi";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyMobile() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const result = await sendOtp(mobile);
      setSessionId(result.sessionId);
      toast.success("OTP sent successfully!");
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOtp(sessionId, otp);

      if (result.success) {
        // Save verified mobile to profiles table
        const user = auth.currentUser;
        if (!user) {
          toast.error("User not found. Please login again.");
          navigate("/login");
          return;
        }

        await axios.post("/api/update-profile", {
          email: user.email,
          mobileNumber: mobile,
          mobileVerified: true,
        });

        toast.success("Mobile verified successfully!");
        navigate("/userdashboard"); // 🚀 Move to dashboard
      } else {
        toast.error("Incorrect OTP. Try again.");
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      toast.error("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Verify Mobile Number</h1>

        <input
          type="text"
          placeholder="Enter Mobile Number"
          value={mobile}
          onChange={(e) =>
            setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className="w-full px-4 py-2 border rounded-md"
          disabled={!!sessionId}
        />

        {!sessionId ? (
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {loading ? "Verifying..." : "Verify & Proceed"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
