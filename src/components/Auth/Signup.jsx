import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { sendOtp, verifyOtp } from "../../api/otpApi"; // 🆕 Added

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startOtpFlow = async (e) => {
    e.preventDefault();
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtp(formData.mobileNumber);
      setOtpSessionId(result.sessionId);
      setAwaitingOtp(true);
      toast.success("OTP sent successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(otpSessionId, otpCode);

      if (result.success) {
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed up with Google!");
      navigate("/login");
    } catch (error) {
      console.error("Google signup error", error.message);
      toast.error("Google signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create your account
        </h1>

        {!awaitingOtp ? (
          <form onSubmit={startOtpFlow} className="space-y-4">
            <div className="flex gap-3">
              <input
                name="firstName"
                onChange={handleChange}
                placeholder="First Name"
                className="w-1/2 px-3 py-2 border rounded-md"
                required
              />
              <input
                name="lastName"
                onChange={handleChange}
                placeholder="Last Name"
                className="w-1/2 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <input
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, ""); // remove non-digits
                if (val.length > 10) val = val.slice(0, 10); // limit to 10 digits
                setFormData((prev) => ({ ...prev, mobileNumber: val }));
              }}
              placeholder="Mobile Number"
              className="w-full px-3 py-2 border rounded-md"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
            <input
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <input
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm">
              OTP sent to {formData.mobileNumber}
            </p>
            <input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <button
              onClick={completeSignup}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              {loading ? "Verifying OTP..." : "Verify OTP & Sign Up"}
            </button>
          </div>
        )}

        <div className="my-4 text-center text-gray-500 text-sm">OR</div>

        <button
          onClick={handleGoogleSignup}
          className="flex items-center justify-center gap-2 border px-4 py-2 rounded w-full mt-3 hover:bg-gray-100"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Sign up with Google</span>
        </button>

        <p className="text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
