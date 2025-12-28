const contactsService = require("../services/contacts.service");

exports.getContacts = async (req, res) => {
  try{
    const contacts=await contactsService.getUserContacts(req.user.userId);
    res.json({contacts})
  }catch(err){
    res.status(401).json({ message: err.message });
  }
};
