const db = require("./db");

const now = new Date().toISOString();

// checks if there are already requests
const count = db.prepare("SELECT COUNT(*) as count FROM requests").get();

if (count.count > 0) {
  console.log("Seed skipped: requests already exist");
  process.exit(0);
}

const insert = db.prepare(`
  INSERT INTO requests
  (title, description, type, status, createdByUserId, createdByUserName, approverComment, approvedByUserId, approvedByUserName, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insert.run(
  "VPN Access",
  "Need VPN for work",
  "Access",
  "Draft",
  1,
  "Hadi",
  null,
  null,
  null,
  now,
  now
);

insert.run(
  "Budget Approval",
  "Requesting budget approval",
  "Finance",
  "Submitted",
  3,
  "Lama",
  null,
  null,
  null,
  now,
  now
);

console.log("Seed data inserted successfully");
