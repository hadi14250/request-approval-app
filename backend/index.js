const express = require("express");
const app = express();


app.use(express.json());

let requests = [];
let nextId = 1;

app.get("/health", (req, res) => {
    res.json({ status : "worked"})
});

app.post("/requests", (req, res) => {
  const { title, description, type } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newRequest = {
    id: nextId,
    title: title,
    description: description || null,
    type: type || general,
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  requests.push(newRequest);
  nextId++;

  res.status(200).json(newRequest);

  console.log("New requests array:", requests);
})


const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
