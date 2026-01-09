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
