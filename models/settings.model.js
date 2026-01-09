const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.fetchUser= async (userId)=>{
  const [rows] = await db.query(
      `
      SELECT id,email,fname,lname,phone,linkedin
      From users WHERE id=?
      `,
      [userId]
    );
  return rows
}

exports.updateUser = async (fname, lname, password, linkedin, userId) => {
  let sql;
  let params;

  if (password) {
    sql = `
      UPDATE users
      SET fname = ?, lname = ?, password = ?, linkedin = ?
      WHERE id = ?
    `;
    params = [fname, lname, password, linkedin, userId];
  } else {
    sql = `
      UPDATE users
      SET fname = ?, lname = ?, linkedin = ?
      WHERE id = ?
    `;
    params = [fname, lname, linkedin, userId];
  }

  const [res] = await db.query(sql, params);
  return res.affectedRows;
};

exports.getUserCV = async (userId) => {
  const [rows] = await db.query(
    "SELECT id FROM users_cv WHERE user_id=?",
    [userId]
  );
  return rows[0] || null;
};

exports.insertUserCV = async (userId, cvText) => {
  const [res] = await db.query(
    "INSERT INTO users_cv (user_id, cv) VALUES (?, ?)",
    [userId, cvText]
  );
  return res.insertId;
};

exports.updateUserCV = async (userId, cvText) => {
  const [res] = await db.query(
    "UPDATE users_cv SET cv=? WHERE user_id=?",
    [cvText, userId]
  );
  return res.affectedRows;
};
