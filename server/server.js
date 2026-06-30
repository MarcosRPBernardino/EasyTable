const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db/database");
const authRoutes = require("./routes/authRoutes")
const tableRoutes = require("./routes/tableRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tables", tableRoutes);

app.get("/", (req, res) => {
    res.send("EasyTable API is running");
});

app.listen(PORT, ()=> {
    console.log(`EasyTable server running on http://localhost:${PORT}`);
});