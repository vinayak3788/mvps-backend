// src/api/otpApi.js
import axios from "axios";

export const sendOtp = async (mobileNumber) => {
  const response = await axios.post(
    "/api/send-otp",
    { mobileNumber },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const verifyOtp = async (sessionId, otpCode) => {
  const response = await axios.post(
    "/api/verify-otp",
    { sessionId, otpCode },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
