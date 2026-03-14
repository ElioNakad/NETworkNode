const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const contactsController = require("../controllers/contacts.controller");

router.get("/", auth, contactsController.getContacts);
router.post("/resync",auth,contactsController.resyncContacts)
router.post("/addcontact", auth, contactsController.addContact);
router.put("/change-block", auth, contactsController.changeBlock);

module.exports = router;