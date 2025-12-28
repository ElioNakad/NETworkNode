const bcrypt = require("bcrypt");
const db = require("../config/db");
const authModel = require("../models/auth.model");
const jwt = require("jsonwebtoken");

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



module.exports = {
  signup,
  login,
};
