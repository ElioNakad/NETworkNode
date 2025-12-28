const bcrypt = require("bcrypt");
const db = require("../config/db");
const authModel = require("../models/auth.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpStore = new Map();

const signup = async (data) => {
  const { email, fname, lname, phone, password, contacts } = data;

  if (!email || !fname || !lname || !phone || !password) {
    throw new Error("Missing fields");
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await authModel.insertUser(conn, {
      email,
      fname,
      lname,
      phone,
      password: hashedPassword,
    });

    for (const c of contacts || []) {
      if (!c.phone) continue;

      const contactId = await authModel.insertOrGetContact(conn, c.phone);

      await authModel.linkUserContact(
        conn,
        userId,
        contactId,
        c.displayName
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const login = async (email, password) => { 
  if (!email || !password) {
    throw new Error("Missing fields");
  }

  const user = await authModel.findByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // ✅ Create JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  // ❌ DO NOT return contacts
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      phone: user.phone,
    },
  };
};

const sendOtp = async (email, payload) => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore.set(email, {
    otp,
    payload,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

const verifyOtpAndSignup = async (email, otp) => {
  const record = otpStore.get(email);

  if (!record) throw new Error("OTP not found");
  if (Date.now() > record.expiresAt) throw new Error("OTP expired");
  if (Number(otp) !== record.otp) throw new Error("Invalid OTP");

  // 🔥 THIS REUSES YOUR EXISTING SIGNUP LOGIC
  await signup(record.payload);

  otpStore.delete(email);
};


module.exports = {
  signup,
  login,
  sendOtp,
  verifyOtpAndSignup
};
