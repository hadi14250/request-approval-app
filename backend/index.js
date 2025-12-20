const express = require("express");

const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());

const users = [
    { id: 1, name: "Hadi", roles: ["Requester"] },
    { id: 2, name: "Haneen", roles: ["Approver"] },
    { id: 3, name: "Lama", roles: ["Approver", "Requester"] }
];

function getCurrentUser(req) {
    const userId = Number(req.headers["user-id"]);

    if (!userId) return null;

    return users.find( (user) => user.id === userId ) || null;
}

function getRequestById(requestId) {
    const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(requestId)

    return request;
}

app.get("/health", (req, res) => {
    res.json({ status : "worked"})
});

app.post("/requests", (req, res) => {

  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Requester")) {
    return res.status(403).json({ error: "Only Requesters can create requests" });
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

    const created = db.prepare("SELECT * FROM requests WHERE id = ?").get(info.lastInsertRowid);
    return res.status(201).json(created);

})

// gets all requests of a single user
app.get("/requests", (req, res) => {
    const user = getCurrentUser(req);
    
    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }
    
    const rows = db.prepare("SELECT * FROM requests WHERE createdByUserId = ? ORDER By id DESC").all(user.id);
    
    return res.json(rows);

})

app.post("/requests/:id/submit", (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }

    if (!user.roles.includes("Requester")) {
        return res.status(403).json({ error: "Only Requesters can submit requests" });
    }
    
    const requestId = Number(req.params.id);
    const request = getRequestById(requestId);

    if (!request) {
        return res.status(404).json({ error: "Request not found" });
    }

    if (request.createdByUserId !== user.id) {
        return res.status(403).json({ error: "Only the user who created the request can submit" });
    }

    if (request.status !== "Draft") {
        return res.status(400).json({ error: "Only Draft requests can be submitted" });
    }

    const nowDate = new Date().toISOString();
    
    db.prepare(`
        UPDATE requests
        SET status = ?, updatedAt = ?
        WHERE id = ?
        `).run("Submitted", nowDate, requestId);
        
    const updated = db.prepare("SELECT * FROM requests where id = ?").get(requestId);
    
    return res.status(200).json(updated);
})

// If user is approver, it shows all pending requests except thier own (if the approver is also a requester), if the user is a requester, it will show them their pending requests
app.get("/requests/pending", (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }

    if (user.roles.includes("Approver")) {
        return res.json(
            db.prepare(`SELECT * FROM requests
                        WHERE status = ? AND createdByUserId <> ?
                        ORDER By id DESC
                        `).all("Submitted", user.id)
        );
    }
    else if (user.roles.includes("Requester")) {
        return res.json (
            db.prepare(`SELECT * FROM requests
                        WHERE status = ? AND createdByUserId = ?
                        ORDER By id DESC
                `).all("Submitted", user.id)
        );
    }
    else
        res.status(403).json({ error: "User has no valid role" });

})

app.post("/requests/:id/approve", (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }

    if (!user.roles.includes("Approver")) {
        return res.status(403).json( { error: "Only Approvers can approve requests" } )
    }

    const requestId = Number(req.params.id);
    const request = getRequestById(requestId);

    if (!request) {
        return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "Submitted") {
        return res.status(400).json({ error: "Only submitted requestes can be approved" });
    }
    if (request.createdByUserId === user.id) {
        return res.status(403).json({ error: "Approver can't approve requests they created" });
    }

    const { approverComment } = req.body;
    
    if (typeof approverComment !== "string" || !approverComment.trim()) {
        return res.status(400).json({ error: "Approver comment is required" });
    }

    request.approverComment = approverComment.trim();
    request.approvedByUserId = user.id;
    request.approvedByUserName = user.name;
    request.status = "Approved";
    request.updatedAt = new Date().toISOString();

    return res.status(200).json(request);
})

app.post("/requests/:id/reject", (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }

    if (!user.roles.includes("Approver")) {
        return res.status(403).json( { error: "Only Approvers can reject requests" } )
    }

    const requestId = Number(req.params.id);
    const request = requests.find (
        (request) => request.id === requestId
    );

    if (!request) {
        return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "Submitted") {
        return res.status(400).json({ error: "Only submitted requestes can be rejected" });
    }
    if (request.createdByUserId === user.id) {
        return res.status(403).json({ error: "Approver can't reject requests they created" });
    }

    const { approverComment } = req.body;
    
    if (typeof approverComment !== "string" || !approverComment.trim()) {
        return res.status(400).json({ error: "Approver comment is required" });
    }

    request.approverComment = approverComment.trim();
    request.approvedByUserId = user.id;
    request.approvedByUserName = user.name;
    request.status = "Rejected";
    request.updatedAt = new Date().toISOString();

    return res.status(200).json(request);
})

app.patch ("/requests/:id/edit", (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }

    if (!user.roles.includes("Requester")) {
        return res.status(403).json({ error: "Only Requesters can edit requests" });
    }

    const requestId = Number(req.params.id);
    const request = requests.find (
        (request) => request.id === requestId
    )

    if (!request) {
        return res.status(404).json({ error: "Request not found" });
    }

    if (request.createdByUserId !== user.id) {
        return res.status(403).json({ error: "Only the user who created the request can edit" });
    }

    if (request.status !== "Draft") {
        return res.status(400).json({ error: "Only Draft requests can be edited" })
    }

    const { title, description, type } = req.body || {};

    if (!title && !description && !type) {
        return res.status(400).json({ error: "Request body is required" });
    }

    if (title !== undefined) {
        if (typeof title !== "string") {
            return res.status(400).json({ error: "Title must be a string" });
        }
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            return res.status(400).json({ error: "Title is required" });
        }
        request.title = trimmedTitle;
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            return res.status(400).json({ error: "Description must be a string" });
        }
        request.description = description;
    }

    if (type !== undefined) {
        const allowedTypes = ["Access", "Finance", "General"];
        const safeType = allowedTypes.includes(type) ? type : "General";
        request.type = safeType;
    }

    request.updatedAt = new Date().toISOString();

    return res.status(200).json(request);
})

app.delete("/requests/:id", (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }

    if (!user.roles.includes("Requester")) {
        return res.status(403).json({ error: "Only Requesters can delete requests" });
    }

    const requestId = Number(req.params.id);
    const request = requests.find (
        (request) => request.id === requestId
    )

    if (!request) {
        return res.status(404).json({ error: "Request not found" });
    }

    if (request.createdByUserId !== user.id) {
        return res.status(403).json({ error: "Only the user who created the request can delete" });
    }

    if (request.status !== "Draft") {
        return res.status(400).json({ error: "Only Draft requests can be deleted" })
    }


    const index = requests.findIndex(
        (request) => request.id === requestId
    );

    requests.splice(index, 1);

    return res.status(204).send();

})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
