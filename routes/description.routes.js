const express = require("express");
const router = express.Router();
const descriptionController = require("../controllers/description.controller");

router.post("/", descriptionController.insertDescriptions);

module.exports = router;