// src/components/Auth/Login.jsx

import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await handlePostLogin();
    } catch (error) {
      console.error("❌ Login error", error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      await handlePostLogin();
    } catch (error) {
      console.error("❌ Google Login error", error);
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePostLogin = async () => {
    const userEmail = auth.currentUser?.email;

    if (!userEmail) {
      toast.error("Login failed. No user email found.");
      return;
    }

    try {
      // 1. Fetch Role
      const roleRes = await axios.get(`/api/get-role?email=${userEmail}`);
      let role = roleRes.data.role;

      // If role is missing/unknown, force "user"
      if (!role || (role !== "admin" && role !== "user")) {
        console.warn("⚠️ Unknown role received. Defaulting to user.");
        role = "user";
      }

      // 2. Fetch Profile
      const profileRes = await axios.get(`/api/get-profile?email=${userEmail}`);
      const { mobileNumber, mobileVerified } = profileRes.data || {};

      if (!mobileNumber || mobileVerified !== 1) {
        toast.error("Mobile number not verified yet.");
        setTimeout(() => {
          navigate("/verify-mobile");
        }, 1000);
        return;
      }

      // 3. Mobile verified, route based on role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/userdashboard");
      }
    } catch (error) {
      console.error("❌ Post login check error:", error);
      toast.error("Login checks failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster />
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login to your account
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center my-4 text-sm text-gray-500">OR</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2 border px-4 py-2 rounded w-full mt-3 hover:bg-gray-100"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Sign in with Google</span>
        </button>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
