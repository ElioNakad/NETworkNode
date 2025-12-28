const authService = require("../services/auth.service");

/*exports.signup = async (req, res) => {
  try {
    await authService.signup(req.body);
    res.json({ message: "Signup successful" });
  }catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: err.message || "Server error" });
  }
};*/

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await authService.login(email, password);

    res.json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};



exports.sendOtp = async (req, res) => {
  const { email, payload } = req.body;

  if (!email || !payload) {
    return res.status(400).json({ message: "Missing data" });
  }

  await authService.sendOtp(email, payload);
  res.json({ message: "OTP sent" });
};

exports.verifyOtpAndSignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await authService.verifyOtpAndSignup(email, otp);
    res.json({ message: "Account created successfully" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(400).json({ message: err.message || "OTP verification failed" });
  }
};