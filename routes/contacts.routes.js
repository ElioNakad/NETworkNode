const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const contactsController = require("../controllers/contacts.controller");

router.get("/", auth, contactsController.getContacts);

module.exports = router;