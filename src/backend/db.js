import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPath = path.resolve("data/orders.db");

const initDb = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      role TEXT DEFAULT 'user',
      protected INTEGER DEFAULT 0,
      blocked INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT,
      fileNames TEXT,
      printType TEXT,
      sideOption TEXT,
      spiralBinding INTEGER,
      totalPages INTEGER,
      totalCost REAL,
      status TEXT DEFAULT 'new',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      orderNumber TEXT
    );

    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      mobileNumber TEXT
    );
  `);

  return db;
};

export const createOrder = async (order) => {
  const db = await initDb();
  const {
    userEmail,
    fileNames,
    printType,
    sideOption,
    spiralBinding,
    totalPages,
    totalCost,
  } = order;

  const result = await db.get(`SELECT MAX(id) as maxId FROM orders`);
  const nextId = (result?.maxId || 0) + 1;
  const orderNumber = `ORD${nextId.toString().padStart(4, "0")}`;

  await db.run(
    `INSERT INTO orders (
      userEmail, fileNames, printType, sideOption,
      spiralBinding, totalPages, totalCost, orderNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userEmail,
      fileNames,
      printType,
      sideOption,
      spiralBinding ? 1 : 0,
      totalPages,
      totalCost,
      orderNumber,
    ],
  );
};

export const getAllOrders = async () => {
  const db = await initDb();
  const rows = await db.all(`SELECT * FROM orders ORDER BY createdAt DESC`);
  return { orders: rows };
};

export const updateOrderStatus = async (id, status) => {
  const db = await initDb();
  return await db.run(`UPDATE orders SET status = ? WHERE id = ?`, [
    status,
    id,
  ]);
};

export const ensureUserRole = async (email) => {
  const db = await initDb();
  const existing = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  if (!existing) {
    await db.run(
      `INSERT INTO users (email, role, protected, blocked) VALUES (?, ?, ?, ?)`,
      [
        email,
        email === "vinayak3788@gmail.com" ? "admin" : "user",
        email === "vinayak3788@gmail.com" ? 1 : 0,
        0,
      ],
    );
  }
  const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  return user.role;
};

export const updateUserRole = async (email, role) => {
  const db = await initDb();
  // protect vinayak3788@gmail.com
  if (email === "vinayak3788@gmail.com") {
    throw new Error("Cannot update role for protected admin.");
  }
  await db.run(`UPDATE users SET role = ? WHERE email = ?`, [role, email]);
};

export const getUserRole = async (email) => {
  const db = await initDb();
  const result = await db.get(`SELECT role FROM users WHERE email = ?`, [
    email,
  ]);
  return result?.role || "user";
};

export const blockUser = async (email) => {
  const db = await initDb();
  // protect vinayak3788@gmail.com
  if (email === "vinayak3788@gmail.com") {
    throw new Error("Cannot block protected admin.");
  }
  await db.run(`UPDATE users SET blocked = 1 WHERE email = ?`, [email]);
};

export const unblockUser = async (email) => {
  const db = await initDb();
  await db.run(`UPDATE users SET blocked = 0 WHERE email = ?`, [email]);
};

export const deleteUser = async (email) => {
  const db = await initDb();
  // protect vinayak3788@gmail.com
  if (email === "vinayak3788@gmail.com") {
    throw new Error("Cannot delete protected admin.");
  }
  await db.run(`DELETE FROM users WHERE email = ?`, [email]);
};

export const isUserBlocked = async (email) => {
  const db = await initDb();
  const result = await db.get(`SELECT blocked FROM users WHERE email = ?`, [
    email,
  ]);
  return result?.blocked === 1;
};
