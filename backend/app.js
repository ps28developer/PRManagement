const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const workflowRoutes = require("./routes/workflow");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workflow", workflowRoutes);

app.get("/health", (req, res) => res.send("API is running..."));

module.exports = app;

