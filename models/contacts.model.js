const db = require("../config/db");

exports.fetchContacts= async (userId)=>{
    const [rows] = await db.query(
      `
      SELECT 
        c.id AS contact_id,
        c.phone,
        uc.id AS user_contact_id,
        uc.display_name
      FROM user_contacts uc
      JOIN contacts c ON c.id = uc.contact_id
      WHERE uc.user_id = ?
      ORDER BY uc.display_name
      `,
      [userId]
    );
  return rows
}

exports.countContacts = async (conn, userId) => {
  const [[row]] = await conn.query(
    `
    SELECT COUNT(*) AS total
    FROM user_contacts
    WHERE user_id = ?
    `,
    [userId]
  );

  return row.total;
};


exports.insertContacts=async(conn,phone)=>{
  const [res] = await conn.query(
    "INSERT INTO contacts (phone) VALUES (?)",
    [phone]
  );
  return res.insertId;
}

exports.insertUserContacts=async(conn,user_id,contact_id,display_name)=>{
  const [res] = await conn.query(
    "INSERT INTO user_contacts (user_id,contact_id,display_name) VALUES (?,?,?)",
    [user_id,contact_id,display_name]
  );
  return res.insertId;
}

exports.getContactByPhone = async (conn, phone) => {
  const [rows] = await conn.query(
    "SELECT id FROM contacts WHERE phone = ?",
    [phone]
  );
  return rows[0] || null;
};

exports.userContactExists = async (conn, user_id, contact_id) => {
  const [rows] = await conn.query(
    "SELECT id FROM user_contacts WHERE user_id = ? AND contact_id = ?",
    [user_id, contact_id]
  );
  return rows.length > 0;
};

exports.updateDisplayName = async (conn, user_id, contact_id, display_name) => {
  const [res] = await conn.query(
    `
    UPDATE user_contacts
    SET display_name = ?
    WHERE user_id = ? AND contact_id = ?
    `,
    [display_name, user_id, contact_id]
  );
  return res.affectedRows;
};
