const contactsService = require("../services/contacts.service");

exports.getContacts = async (req, res) => {
  try{
    const contacts=await contactsService.getUserContacts(req.user.userId);
    res.json({contacts})
  }catch(err){
    res.status(401).json({ message: err.message });
  }
};

exports.resyncContacts = async (req, res) => {
  try {
    const { allContacts } = req.body;

    if (!Array.isArray(allContacts)) {
      return res.status(400).json({
        message: "allContacts must be an array",
      });
    }

    const result = await contactsService.resyncContacts(
      allContacts,
      req.user.userId
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addContact = async (req, res) => {

  try {

    const userId = req.user.userId;
    const { phone, display_name } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const result = await contactsService.addContact(userId, phone, display_name);

    if (result === "ALREADY_EXISTS") {
      return res.status(200).json({
        message: "Contact already exists for this user"
      });
    }

    res.json({
      message: "Contact added successfully",
      contact_id: result
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};

exports.changeBlock = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { contact_id, block } = req.body;

    if (!contact_id || block === undefined) {
      return res.status(400).json({
        message: "contact_id and block are required"
      });
    }

    const result = await contactsService.changeBlock(
      userId,
      contact_id,
      block
    );

    if (result === 0) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    res.json({
      message: "Block status updated successfully"
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};