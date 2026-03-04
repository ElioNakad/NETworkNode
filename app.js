require("dotenv").config(); // 👈 MUST be first

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const contactsRoutes = require("./routes/contacts.routes");
const descriptionsRoutes=require("./routes/description.routes")
const reviewRoutes=require("./routes/review.routes")
const settingsRoutes=require("./routes/settings.routes")

const aiRoutes=require("./routes/ai.routes")

const referralAI=require("./routes/referralAI.routes")
const recommendationRoutes = require("./routes/recommendations.routes");

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/description", descriptionsRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/settings", settingsRoutes);

app.use("/api/ai",aiRoutes );

app.use("/api/referralai", referralAI);
app.use("/api/recommendations", recommendationRoutes);

module.exports = app;