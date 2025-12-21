const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

// splits env CORS_ORIGINS links and whitelists them
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error("CORS not allowed for this origin: " + origin))
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "user-id"],
}))


app.use(express.json());

const users = [
  { id: 1, name: "Hadi", roles: ["Requester"] },
  { id: 2, name: "Haneen", roles: ["Approver"] },
  { id: 3, name: "Lama", roles: ["Approver", "Requester"] },
];

function getCurrentUser(req) {
  const userId = Number(req.headers["user-id"]);

  if (!userId) return null;

  return users.find((user) => user.id === userId) || null;
}

function getRequestById(requestId) {
  const request = db
    .prepare("SELECT * FROM requests WHERE id = ?")
    .get(requestId);

  return request;
}

app.get("/health", (req, res) => {
  res.json({ status: "worked" });
});

// Requester only endpoint
// creates a requests, requires body with title, description, and type
// returns the created request if successful
app.post("/requests", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Requester")) {
    return res
      .status(403)
      .json({ error: "Only Requesters can create requests" });
  }

  const { title, description, type } = req.body || {};

  if (typeof title !== "string") {
    return res.status(400).json({ error: "Title must be a string" });
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return res.status(400).json({ error: "Title is required" });
  }

  const allowedTypes = ["Access", "Finance", "General"];
  const safeType = allowedTypes.includes(type) ? type : "General";

  const nowDate = new Date().toISOString();

  const insert = db.prepare(`
        INSERT INTO requests
        (title, description, type, status, createdByUserId, createdByUserName, approverComment, approvedByUserId, approvedByUserName, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

  const info = insert.run(
    trimmedTitle,
    description ?? null,
    safeType,
    "Draft",
    user.id,
    user.name,
    null,
    null,
    null,
    nowDate,
    nowDate
  );

  const created = db
    .prepare("SELECT * FROM requests WHERE id = ?")
    .get(info.lastInsertRowid);
  return res.status(201).json(created);
});

// Requester only endpoint
// gets all requests of a single user
app.get("/requests", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  const rows = db
    .prepare(
      "SELECT * FROM requests WHERE createdByUserId = ? ORDER By id DESC"
    )
    .all(user.id);

  return res.json(rows);
});

// Requester only endpoint
// changes request status from "Draft" to "Submitted", fails if status is not "Draft"
// returns submitted request if successfull
app.post("/requests/:id/submit", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Requester")) {
    return res
      .status(403)
      .json({ error: "Only Requesters can submit requests" });
  }

  const requestId = Number(req.params.id);
  const request = getRequestById(requestId);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.createdByUserId !== user.id) {
    return res
      .status(403)
      .json({ error: "Only the user who created the request can submit" });
  }

  if (request.status !== "Draft") {
    return res
      .status(400)
      .json({ error: "Only Draft requests can be submitted" });
  }

  const nowDate = new Date().toISOString();

  db.prepare(
    `
        UPDATE requests
        SET status = ?, updatedAt = ?
        WHERE id = ?
        `
  ).run("Submitted", nowDate, requestId);

  const updated = db
    .prepare("SELECT * FROM requests where id = ?")
    .get(requestId);

  return res.status(200).json(updated);
});

// Approver only endpoint
// If user is approver, it shows all pending requests except thier own (if the approver is also a requester)
// if the user is a requester, it will show them their pending requests
app.get("/requests/pending", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (user.roles.includes("Approver")) {
    return res.json(
      db
        .prepare(
          `SELECT * FROM requests
                        WHERE status = ? AND createdByUserId <> ?
                        ORDER By id DESC
                        `
        )
        .all("Submitted", user.id)
    );
  } else if (user.roles.includes("Requester")) {
    return res.json(
      db
        .prepare(
          `SELECT * FROM requests
                        WHERE status = ? AND createdByUserId = ?
                        ORDER By id DESC
                `
        )
        .all("Submitted", user.id)
    );
  } else res.status(403).json({ error: "User has no valid role" });
});

// Approver only endpoint
// changes request status from "Submitted" to "Approved", fails if status is not "Submitted"
// requires body with approverComment
// returns approved request if successfull
app.post("/requests/:id/approve", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Approver")) {
    return res
      .status(403)
      .json({ error: "Only Approvers can approve requests" });
  }

  const requestId = Number(req.params.id);
  const request = getRequestById(requestId);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.status !== "Submitted") {
    return res
      .status(400)
      .json({ error: "Only submitted requestes can be approved" });
  }
  if (request.createdByUserId === user.id) {
    return res
      .status(403)
      .json({ error: "Approver can't approve requests they created" });
  }

  const { approverComment } = req.body || {};

  if (typeof approverComment !== "string" || !approverComment.trim()) {
    return res.status(400).json({ error: "Approver comment is required" });
  }

  const nowDate = new Date().toISOString();

  db.prepare(
    `
                UPDATE requests
                SET status = ?, approverComment = ?,  approvedByUserId = ?, approvedByUserName = ?, updatedAt = ?
                WHERE id = ?
        `
  ).run(
    "Approved",
    approverComment.trim(),
    user.id,
    user.name,
    nowDate,
    requestId
  );

  const updated = db
    .prepare(`SELECT * FROM requests WHERE id = ?`)
    .get(requestId);

  return res.status(200).json(updated);
});

// Approver only endpoint
// changes request status from "Submitted" to "Rejected", fails if status is not "Submitted"
// requires body with approverComment
// returns rejected request if successfull
app.post("/requests/:id/reject", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Approver")) {
    return res
      .status(403)
      .json({ error: "Only Approvers can reject requests" });
  }

  const requestId = Number(req.params.id);
  const request = getRequestById(requestId);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.status !== "Submitted") {
    return res
      .status(400)
      .json({ error: "Only submitted requestes can be rejected" });
  }
  if (request.createdByUserId === user.id) {
    return res
      .status(403)
      .json({ error: "Approver can't reject requests they created" });
  }

  const { approverComment } = req.body || {};

  if (typeof approverComment !== "string" || !approverComment.trim()) {
    return res.status(400).json({ error: "Approver comment is required" });
  }

  const nowDate = new Date().toISOString();

  db.prepare(
    `
        UPDATE requests
        SET status = ?, approverComment = ?, approvedByUserId = ?, approvedByUserName = ?, updatedAt = ?
        WHERE id = ?
        `
  ).run(
    "Rejected",
    approverComment.trim(),
    user.id,
    user.name,
    nowDate,
    requestId
  );

  const updated = db
    .prepare(`SELECT * FROM requests WHERE id = ?`)
    .get(requestId);

  return res.status(200).json(updated);
});

// Requester only endpoint
// Edits requests only if status is "Draft", takes optional fields: title, decription, and type
// returns edited request if successfull
app.patch("/requests/:id/edit", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Requester")) {
    return res.status(403).json({ error: "Only Requesters can edit requests" });
  }

  const requestId = Number(req.params.id);
  const request = getRequestById(requestId);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.createdByUserId !== user.id) {
    return res
      .status(403)
      .json({ error: "Only the user who created the request can edit" });
  }

  if (request.status !== "Draft") {
    return res.status(400).json({ error: "Only Draft requests can be edited" });
  }

  const { title, description, type } = req.body || {};

  if (!title && !description && !type) {
    return res.status(400).json({ error: "Request body is required" });
  }

  let newTitle = request.title;
  let newDescription = request.description;
  let newType = request.type;

  if (title !== undefined) {
    if (typeof title !== "string") {
      return res.status(400).json({ error: "Title must be a string" });
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return res.status(400).json({ error: "Title is required" });
    }
    newTitle = trimmedTitle;
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ error: "Description must be a string" });
    }
    newDescription = description;
  }

  if (type !== undefined) {
    const allowedTypes = ["Access", "Finance", "General"];
    const safeType = allowedTypes.includes(type) ? type : "General";
    newType = safeType;
  }

  const nowDate = new Date().toISOString();

  db.prepare(
    `
        UPDATE requests
        SET title = ?, description = ?, type = ?, updatedAt = ?
        WHERE id = ?
        `
  ).run(newTitle, newDescription, newType, nowDate, requestId);

  const updated = db
    .prepare(`SELECT * FROM requests WHERE id = ?`)
    .get(requestId);

  return res.status(200).json(updated);
});

// Requester only endpoint
// Deletes a request from the Databse
app.delete("/requests/:id", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Requester")) {
    return res
      .status(403)
      .json({ error: "Only Requesters can delete requests" });
  }

  const requestId = Number(req.params.id);
  const request = getRequestById(requestId);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.createdByUserId !== user.id) {
    return res
      .status(403)
      .json({ error: "Only the user who created the request can delete" });
  }

  if (request.status !== "Draft") {
    return res
      .status(400)
      .json({ error: "Only Draft requests can be deleted" });
  }

  db.prepare(`Delete FROM requests WHERE id = ?`).run(requestId);
  return res.status(204).send();
});

module.exports = app;
