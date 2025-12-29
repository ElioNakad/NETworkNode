const descriptionService = require("../services/description.service");

exports.getDescriptions = async (req, res) => {
  try{
    const descriptions=await descriptionService.getDescriptions(req.user.userId,req.contact.contactId);
    res.json({descriptions})
  }catch(err){
    res.status(401).json({ message: err.message });
  }
};

exports.insertDescriptions = async (req, res) => {
  try {
    const { user_contact_id, label, description } = req.body;

    if (!user_contact_id || !label || !description) {
      return res.status(400).json({ message: "Missing data" });
    }

    const id = await descriptionService.insertDescriptions(
      user_contact_id,
      label,
      description
    );

    res.json({ id, message: "Description added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
