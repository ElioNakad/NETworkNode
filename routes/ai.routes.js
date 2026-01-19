const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const aiController = require("../controllers/ai.controller");

router.post("/search", auth, aiController.search);

module.exports = router;
