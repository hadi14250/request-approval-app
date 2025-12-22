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

// Draft requests
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
  "Office Supplies Request",
  "Need new desk chair and monitor stand",
  "General",
  "Draft",
  3,
  "Lama",
  null,
  null,
  null,
  now,
  now
);

// Submitted requests
insert.run(
  "Budget Approval for Q1",
  "Requesting budget approval for marketing campaign",
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

insert.run(
  "Database Access",
  "Need read access to production database",
  "Access",
  "Submitted",
  1,
  "Hadi",
  null,
  null,
  null,
  now,
  now
);

// Approved requests - approved by Haneen
insert.run(
  "Training Budget Approval",
  "Request for React training course budget",
  "Finance",
  "Approved",
  1,
  "Hadi",
  "Approved. This training aligns with our development goals.",
  2,
  "Haneen",
  now,
  now
);

// Approved requests - approved by Lama
insert.run(
  "New Laptop Request",
  "Current laptop is 5 years old and running slow",
  "General",
  "Approved",
  1,
  "Hadi",
  "Approved. IT budget has room for this upgrade.",
  3,
  "Lama",
  now,
  now
);

// Rejected requests - rejected by Haneen
insert.run(
  "Conference Ticket",
  "Request to attend tech conference in Dubai",
  "General",
  "Rejected",
  3,
  "Lama",
  "Travel budget is exhausted for this quarter. Please resubmit next quarter.",
  2,
  "Haneen",
  now,
  now
);

// Rejected requests - rejected by Lama
insert.run(
  "Premium Software License",
  "Request for premium version of design software",
  "Access",
  "Rejected",
  1,
  "Hadi",
  "The free version covers our current needs. Let's revisit if requirements change.",
  3,
  "Lama",
  now,
  now
);

console.log("Seed data inserted successfully");
