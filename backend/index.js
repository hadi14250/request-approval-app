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

  const user  = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Missing user-id in header" });
  }

  if (!user.roles.includes("Requester")) {
    return res.status(401).json({ error: "Only Requesters can create requests" });
  }

  const { title, description, type } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newRequest = {
    id: nextId,
    title: title,
    description: description || null,
    type: type || "General",
    status: "Draft",
    createdByUserId: user.id,
    createdByUserName: user.name,
    approverComment: null,
    approvedByUserId: null,
    approvedByUserName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  requests.push(newRequest);
  nextId++;

  res.status(201).json(newRequest);

  console.log("New requests array:", requests);
})


const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
