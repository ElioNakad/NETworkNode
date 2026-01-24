const db = require("../config/db");

exports.insertUser = async (conn, user) => {
  const [res] = await conn.query(
    "INSERT INTO users (email, fname, lname, phone, password, linkedin) VALUES (?, ?, ?, ?, ?, ?)",
    [user.email, user.fname, user.lname, user.phone, user.password, user.linkedin]
  );
  return res.insertId;
};

exports.insertOrGetContact = async (conn, phone) => {
  await conn.query(
    "INSERT IGNORE INTO contacts (phone) VALUES (?)",
    [phone]
  );

  const [[contact]] = await conn.query(
    "SELECT id FROM contacts WHERE phone = ?",
    [phone]
  );

  return contact.id;
};

exports.linkUserContact = async (conn, userId, contactId, displayName) => {
  await conn.query(
    `INSERT IGNORE INTO user_contacts (user_id, contact_id, display_name)
     VALUES (?, ?, ?)`,
    [userId, contactId, displayName || null]
  );
};

exports.findByEmail = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows[0];
};

exports.checkUserPhone=async(phone)=>{
  const user=await db.query(
    "SELECT * FROM users WHERE phone=?",
    [phone]
  );
  return user;
}
