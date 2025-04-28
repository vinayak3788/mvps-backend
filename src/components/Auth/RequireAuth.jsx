// src/components/Auth/RequireAuth.jsx

import { useEffect, useState } from "react";
import { auth } from "../../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function RequireAuth({ children, role }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("No user logged in.");
        navigate("/login");
      } else {
        try {
          const response = await axios.get(`/api/get-role?email=${user.email}`);
          const userRole = response.data.role;

          if (role === "admin" && userRole !== "admin") {
            toast.error("Access denied. You are not an admin.");
            navigate("/userdashboard");
          } else if (role === "user" && userRole !== "user") {
            toast.error("Access denied. You are not a normal user.");
            navigate("/admin");
          } else {
            // Access allowed
          }
        } catch (err) {
          console.error("Role check failed", err);
          navigate("/login");
        }
      }
      setPending(false);
    });

    return () => unsubscribe();
  }, [navigate, role]);

  if (pending) {
    return <div className="text-center mt-10">Checking login...</div>;
  }

  return children;
}
