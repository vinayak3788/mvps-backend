// src/components/Auth/Signup.jsx

import React from "react";
import { Toaster } from "react-hot-toast";
import SignupForm from "./SignupForm";
import GoogleSignupButton from "./GoogleSignupButton";

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create your account
        </h1>

        <SignupForm />

        <div className="my-4 text-center text-gray-500 text-sm">OR</div>

        <GoogleSignupButton />

        <p className="text-sm text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
