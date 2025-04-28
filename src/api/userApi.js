// src/api/userApi.js

import axios from "axios";

export const getAllUsers = async () => {
  const res = await axios.get("/api/get-users");
  return res.data;
};

export const updateUserRole = async (email, role) => {
  const res = await axios.post("/api/update-role", { email, role });
  return res.data;
};

export const deleteUser = async (email) => {
  const res = await axios.post("/api/delete-user", { email });
  return res.data;
};

export const blockUser = async (email) => {
  const res = await axios.post("/api/block-user", { email });
  return res.data;
};

export const unblockUser = async (email) => {
  const res = await axios.post("/api/unblock-user", { email });
  return res.data;
};

export const updateProfile = async (
  email,
  { firstName, lastName, mobileNumber },
) => {
  const res = await axios.post("/api/update-profile", {
    email,
    firstName,
    lastName,
    mobileNumber,
  });
  return res.data;
};
