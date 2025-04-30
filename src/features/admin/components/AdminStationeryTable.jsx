//src/features/admin/components/AdminStationeryTable.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import EditStationeryModal from "./EditStationeryModal";

const AdminStationeryTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/stationery/products");
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`/api/admin/stationery/delete/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">📦 All Stationery Products</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Image</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Discount</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id} className="text-center">
                  <td className="px-4 py-2 border">{idx + 1}</td>
                  <td className="px-4 py-2 border">
                    {Array.isArray(p.images) ? (
                      p.images.length > 0
                    ) : p.images?.split(",").length > 0 ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-16 h-16 object-cover mx-auto"
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border">{p.name}</td>
                  <td className="px-4 py-2 border">₹{p.price.toFixed(2)}</td>
                  <td className="px-4 py-2 border">{p.discount || 0}%</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                      onClick={() => setEditProduct(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editProduct && (
        <EditStationeryModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdate={() => {
            setEditProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

export default AdminStationeryTable;
