const express = require("express");
const app = express();


app.use(express.json());

let requests = [];
let nextId = 1;

const users = [
    { id: 1, name: "Hadi", roles: ["Requester"] },
    { id: 2, name: "Haneen", roles: ["Approver"] },
    { id: 3, name: "Lama", roles: ["Approver", "Requester"] }
];

function getCurrentUser(req) {
    const userId = Number(req.headers["user-id"]);

    if (!userId) return null;

    return users.find( (user) => user.id === userId ) || null

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
    return res.status(401).json({ error: "Only Requesters can create requests" });
  }

  const { title, description, type } = req.body;

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

  const newRequest = {
    id: nextId,
    title: trimmedTitle,
    description: description || "",
    type: safeType,
    status: "Draft",
    createdByUserId: user.id,
    createdByUserName: user.name,
    approverComment: null,
    approvedByUserId: null,
    approvedByUserName: null,
    createdAt: nowDate,
    updatedAt: nowDate
  }

  requests.push(newRequest);
  nextId++;

  res.status(201).json(newRequest);
})

// gets all requests of a single user
app.get("/requests", (req, res) => {
    const user = getCurrentUser(req);
    
    if (!user) {
        return res.status(401).json({ error: "Missing user-id in header" });
    }

    res.json(
    requests.filter(
        (request) => request.createdByUserId === user.id
    )
  );
})


const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
