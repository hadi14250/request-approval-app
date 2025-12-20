const Database = require("better-sqlite3");

const db = new Database("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    createdByUserId INTEGER NOT NULL,
    createdByUserName TEXT NOT NULL,
    approverComment TEXT,
    approvedByUserId INTEGER,
    approvedByUserName TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

module.exports = db;
