// src/server/setupDb.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const initDB = async () => {
  const db = await open({
    filename: "./orders.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      files TEXT,
      printType TEXT,
      sideOption TEXT,
      spiralBinding INTEGER,
      totalCost INTEGER,
      createdAt TEXT
    );
  `);

  console.log("✅ SQLite DB initialized.");
};

initDB();
