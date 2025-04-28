import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { PDFDocument } from "pdf-lib";
import { auth } from "../../config/firebaseConfig";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [printType, setPrintType] = useState("bw");
  const [sideOption, setSideOption] = useState("single");
  const [spiralBinding, setSpiralBinding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pending, setPending] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("No user logged in.");
        navigate("/login");
      } else {
        console.log("✅ Firebase User restored:", user.email);
        await validateMobile();
        setPending(false);
        fetchMyOrders(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  if (pending) {
    return <div className="text-center mt-10">Checking login...</div>;
  }

  const validateMobile = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("No user logged in. Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`/api/get-profile?email=${user.email}`);
      const mobile = res.data?.mobileNumber;
      if (!mobile) {
        toast.error("Mobile number not verified.");
        setTimeout(() => {
          navigate("/verify-mobile");
        }, 1000);
      }
    } catch (err) {
      console.error("❌ Error checking mobile verification", err);
      toast.error("Mobile verification failed. Login again.");
      navigate("/login");
    }
  };

  const fetchMyOrders = async (email) => {
    try {
      const res = await axios.get("/api/get-orders");
      const allOrders = res.data.orders || [];
      const userOrders = allOrders.filter((order) => order.userEmail === email);
      setMyOrders(userOrders);
    } catch (err) {
      console.error("❌ Error fetching orders", err);
      toast.error("Failed to fetch your orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files).filter((file) =>
      file.name.endsWith(".pdf"),
    );
    const updatedFiles = await Promise.all(
      selected.map(async (file) => {
        try {
          const buffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(buffer);
          return {
            name: file.name,
            pages: pdfDoc.getPageCount(),
            raw: file,
          };
        } catch {
          toast.error(`Error reading ${file.name}`);
          return { name: file.name, pages: 0, raw: file };
        }
      }),
    );
    setFiles(updatedFiles);
  };

  const getPrice = () => {
    const pricePerPage = printType === "color" ? 5 : 2;
    let total = files.reduce(
      (sum, file) => sum + (file.pages || 0) * pricePerPage,
      0,
    );
    if (spiralBinding) total += 30;
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length || files.some((f) => !f.pages)) {
      toast.error("Please upload PDFs and wait for page count.");
      return;
    }

    const formData = new FormData();
    formData.append("user", auth.currentUser?.email || "");
    formData.append("printType", printType);
    formData.append("sideOption", sideOption);
    formData.append("spiralBinding", spiralBinding);
    formData.append("totalCost", getPrice());
    formData.append("createdAt", new Date().toISOString());
    formData.append("pageCounts", JSON.stringify(files.map((f) => f.pages)));

    files.forEach((fileObj) => {
      if (fileObj.raw) {
        formData.append("files", fileObj.raw);
      }
    });

    try {
      setIsSubmitting(true);
      await axios.post("/api/submit-order", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Order submitted successfully!");
      setFiles([]);
      fetchMyOrders(auth.currentUser.email); // reload orders after submit
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("Failed to submit order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🖨️ MVPS Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* 🖨️ Upload New Order Section */}
      <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4">Place Your Print Order</h2>

        <form onSubmit={handleSubmit}>
          <label className="block font-medium mb-1">Upload PDF(s)</label>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
          />

          <div className="flex gap-4 mt-4">
            <div>
              <p className="font-medium mb-1">Print Type:</p>
              <label className="block">
                <input
                  type="radio"
                  name="printType"
                  value="bw"
                  checked={printType === "bw"}
                  onChange={() => setPrintType("bw")}
                />
                B/W (₹2/page)
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="printType"
                  value="color"
                  checked={printType === "color"}
                  onChange={() => setPrintType("color")}
                />
                Color (₹5/page)
              </label>
            </div>

            <div>
              <p className="font-medium mb-1">Print Side:</p>
              <label className="block">
                <input
                  type="radio"
                  name="sideOption"
                  value="single"
                  checked={sideOption === "single"}
                  onChange={() => setSideOption("single")}
                />
                Single Sided
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="sideOption"
                  value="double"
                  checked={sideOption === "double"}
                  onChange={() => setSideOption("double")}
                />
                Back to Back
              </label>
            </div>
          </div>

          <div className="mt-3">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={spiralBinding}
                onChange={() => setSpiralBinding((prev) => !prev)}
              />
              <span className="ml-2 font-medium">Add Spiral Binding (₹30)</span>
            </label>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Uploaded Files</h3>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left p-2">File</th>
                  <th className="text-right p-2">Pages</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f, idx) => (
                  <tr key={idx}>
                    <td className="p-2">{f.name}</td>
                    <td className="text-right p-2">
                      {f.pages ? f.pages : "Loading..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 font-bold text-right">Total Cost: ₹{getPrice()}</p>

          <button
            type="submit"
            className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
            disabled={
              !files.length || files.some((f) => !f.pages) || isSubmitting
            }
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </button>
        </form>
      </div>

      {/* 📋 Show Previous Orders */}
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">My Previous Orders</h2>

        {ordersLoading ? (
          <div className="text-center">Loading orders...</div>
        ) : myOrders.length === 0 ? (
          <div className="text-center text-gray-500">No past orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Order No</th>
                  <th className="p-2">Files</th>
                  <th className="p-2">Total Pages</th>
                  <th className="p-2">Cost</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-2">{order.orderNumber}</td>
                    <td className="p-2">{order.fileNames}</td>
                    <td className="p-2">{order.totalPages}</td>
                    <td className="p-2">₹{order.totalCost}</td>
                    <td className="p-2">{order.status}</td>
                    <td className="p-2">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
