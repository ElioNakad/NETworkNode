const express = require("express");
const axios = require("axios");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

const PYTHON_URL = "http://127.0.0.1:5001"; // change if needed

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const response = await axios.get(
      `${PYTHON_URL}/recommend/${userId}`,
      {
        params: { top_n: 5 }
      }
    );

    res.json({
      recommendations: response.data
    });

  } catch (error) {
   console.error("FULL ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

module.exports = router;