require("dotenv").config(); // 👈 MUST be first

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const contactsRoutes = require("./routes/contacts.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);

module.exports = app;