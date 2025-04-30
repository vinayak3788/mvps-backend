import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { auth } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";

export default function UploadOrderForm({ files, setFiles }) {
  const [printType, setPrintType] = useState("bw");
  const [sideOption, setSideOption] = useState("single");
  const [spiralBinding, setSpiralBinding] = useState(false);

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files).filter((file) =>
      file.name.endsWith(".pdf"),
    );
    const updatedFiles = await Promise.all(
      selected.map(async (file) => {
        try {
          const buffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(buffer);
          return { name: file.name, pages: pdfDoc.getPageCount(), raw: file };
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

  const handleAddToCart = () => {
    if (!files.length || files.some((f) => !f.pages)) {
      toast.error("Please upload PDFs and wait for page count.");
      return;
    }

    const userEmail = auth.currentUser?.email;
    const orderNumber = `Order${Date.now().toString().slice(-6)}`;

    const cart = JSON.parse(localStorage.getItem("mvps-cart") || "[]");

    const newOrder = {
      type: "print",
      user: userEmail,
      orderNumber,
      printType,
      sideOption,
      spiralBinding,
      totalCost: getPrice(),
      createdAt: new Date().toISOString(),
      files: files.map((f) => ({ name: f.name, pages: f.pages })),
    };

    // Store raw files separately under orderNumber
    const rawFileStorageKey = `rawFiles-${orderNumber}`;
    localStorage.setItem(
      rawFileStorageKey,
      JSON.stringify(
        files.map((f) => ({
          name: f.name,
          base64: "", // optionally prepare for future use
        })),
      ),
    );

    localStorage.setItem("mvps-cart", JSON.stringify([...cart, newOrder]));
    toast.success("🛒 Added to cart!");
    setFiles([]);
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto mb-8">
      <h2 className="text-lg font-semibold mb-4">Place Your Print Order</h2>

      <label className="block font-medium mb-1">Upload PDF(s)</label>
      <input type="file" accept=".pdf" multiple onChange={handleFileChange} />

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
            />{" "}
            B/W (₹2/page)
          </label>
          <label className="block">
            <input
              type="radio"
              name="printType"
              value="color"
              checked={printType === "color"}
              onChange={() => setPrintType("color")}
            />{" "}
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
            />{" "}
            Single Sided
          </label>
          <label className="block">
            <input
              type="radio"
              name="sideOption"
              value="double"
              checked={sideOption === "double"}
              onChange={() => setSideOption("double")}
            />{" "}
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
        onClick={handleAddToCart}
        className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
        disabled={!files.length || files.some((f) => !f.pages)}
      >
        🛒 Add to Cart
      </button>
    </div>
  );
}
