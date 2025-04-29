import React from "react";

export default function UsersTable({
  users,
  loading,
  handleRoleChange,
  handleBlockUser,
  handleUnblockUser,
  handleDeleteUser,
  handleVerifyMobile,
  setEditUser,
}) {
  if (loading) {
    return <div className="text-center p-4">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="text-center">No users found.</div>;
  }

  return (
    <table className="min-w-full bg-white shadow rounded-lg text-center">
      <thead className="bg-gray-100">
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Mobile</th>
          <th>Mobile Verified</th>
          <th>Blocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.email}>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.firstName || "-"}</td>
            <td>{user.lastName || "-"}</td>
            <td>{user.mobileNumber || "-"}</td>
            <td>{user.mobileVerified ? "Yes" : "No"}</td>
            <td>{user.blocked ? "Yes" : "No"}</td>
            <td className="space-x-1">
              <button
                onClick={() =>
                  handleRoleChange(
                    user.email,
                    user.role === "admin" ? "user" : "admin",
                  )
                }
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                {user.role === "admin" ? "Make User" : "Make Admin"}
              </button>
              <button
                onClick={() => setEditUser(user)}
                className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => handleVerifyMobile(user.email)}
                className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
              >
                {user.mobileVerified ? "Unverify Mobile" : "Verify Mobile"}
              </button>
              {user.blocked ? (
                <button
                  onClick={() => handleUnblockUser(user.email)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Unblock
                </button>
              ) : (
                <button
                  onClick={() => handleBlockUser(user.email)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                >
                  Block
                </button>
              )}
              <button
                onClick={() => handleDeleteUser(user.email)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
