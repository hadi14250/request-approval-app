const app = require('express')();

let requests = []
let nextId = 1

app.get("/health", (req, res) => {
    res.json({ status : "worked"})
})

app.get("/requests", (req, res) => {
  res.json(requests)
})

app.post("/requests/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Post request received with id: ${id}`);
    res.status(200).json({ message: `Post request with id ${id} received` });
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
