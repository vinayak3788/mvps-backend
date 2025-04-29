import React, { useState } from "react";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import toast from "react-hot-toast";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      await axios.post("/api/create-user-profile", {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
      });

      toast.success("Signup successful!");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      toast.error("Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
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
          let val = e.target.value.replace(/\D/g, "");
          if (val.length > 10) val = val.slice(0, 10);
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
      <div className="relative">
        <input
          name="password"
          type={showPwd ? "text" : "password"}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md pr-10"
          required
        />
        <span
          className="absolute right-3 top-2 cursor-pointer text-gray-500"
          onClick={() => setShowPwd((prev) => !prev)}
        >
          {showPwd ? "🙈" : "👁️"}
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
      >
        {loading ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}
