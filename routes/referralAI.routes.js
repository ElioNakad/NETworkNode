const express = require("express");
const router = express.Router();
const http = require("http");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/referral-search", authMiddleware, async (req, res) => {
  const userId = req.user.userId; // from JWT
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "Prompt required" });
  }

  const postData = JSON.stringify({
    user_id: Number(userId),
    prompt: String(prompt)
  });

  const options = {
    hostname: "127.0.0.1",
    port: 5001,
    path: "/referral/search",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };

  const aiReq = http.request(options, (aiRes) => {
    let data = "";

    aiRes.on("data", chunk => {
      data += chunk;
    });

    aiRes.on("end", () => {
      try {
        res.json(JSON.parse(data));
      } catch (err) {
        console.error("Invalid AI response:", data);
        res.status(500).json({ message: "Invalid AI response" });
      }
    });
  });

  aiReq.on("error", (err) => {
    console.error("AI service error:", err);
    res.status(500).json({ message: "AI service unreachable" });
  });

  aiReq.write(postData);
  aiReq.end();
});

module.exports = router;
