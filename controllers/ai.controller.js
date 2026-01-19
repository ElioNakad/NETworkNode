const aiService = require("../services/ai.service");

exports.search = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const result = await aiService.search(userId, prompt);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI search failed" });
  }
};
