const settingService = require("../services/settings.service");
const bcrypt = require("bcrypt");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

exports.fetchUser = async (req, res) => {
  try {
    const userId = req.user.userId;        // from JWT middleware

    const user = await settingService.fetchUser(userId)

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fname, lname, password, linkedin } = req.body;

    if (!fname || !lname) {
      return res.status(400).json({ message: "First and last name required" });
    }

    let hashedPassword = null;

    // 🔐 Hash password ONLY if user entered one
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const affectedRows = await settingService.updateUser(
      fname,
      lname,
      hashedPassword, // ⬅️ send hashed or null
      linkedin,
      userId
    );

    return res.json({
      message:
        affectedRows === 0
          ? "No changes detected (already up to date)"
          : "Profile updated successfully",
    });
  } catch (err) {
    console.error("❌ updateUser error FULL:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCV = async (req, res) => {
  console.log("FILES:", req.file);
  console.log("BODY:", req.body);

  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "No CV file uploaded",
      });
    }

    let cvText = null;
    const { mimetype, buffer } = req.file;

    // 📄 PDF
    if (mimetype === "application/pdf") {
      const data = await pdfParse(buffer);
      cvText = data.text;
    }
    // 📄 DOCX
    else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      cvText = result.value;
    }
    // ❌ Unsupported
    else {
      return res.status(400).json({
        message: "Unsupported CV file type",
      });
    }

    await settingService.saveUserCV(userId, cvText);

    res.json({
      success: true,
      message: "CV uploaded and processed successfully",
    });
  } catch (err) {
    console.error("❌ UPDATE CV ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
