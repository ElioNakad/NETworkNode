const descriptionService = require("../services/description.service");

exports.getDescriptions = async (req, res) => {
  try {
    const userId = req.user.userId;        // from JWT middleware
    const contactId = req.params.contactId; // from URL

    const descriptions = await descriptionService.getDescriptions(
      userId,
      contactId
    );

    res.json({ descriptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDefaultDescriptions = async (req, res) => {

  try {
        console.log("GET userId:", req.user.userId); // 👈 ADD THIS

    const userId = req.user.userId;        // from JWT middleware

    const descriptions = await descriptionService.getDefaultDescriptions(
      userId,
    );

    res.json({ descriptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

exports.insertDefaultDescriptions = async (req, res) => {
  console.log("INSERT userId:", req.user.userId);

  try {
    const { label, description } = req.body;
    const users_id = req.user.userId;

    if (!label || !description) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const id = await descriptionService.insertDefaultDescriptions(
      users_id,
      label,
      description
    );

    res.json({ id, message: "Default description saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
