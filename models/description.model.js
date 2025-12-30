const db = require("../config/db");

exports.fetchContactDescriptions= async (userId,contactId)=>{
    const [rows] = await db.query(
      `
      SELECT
        ucd.id,
        ucd.label,
        ucd.description
      FROM user_contact_descriptions ucd
      JOIN user_contacts uc
       ON ucd.user_contact_id = uc.id
      WHERE uc.user_id = ?
      AND uc.contact_id = ?;
      `,
      [userId,contactId]
    );
    return rows
}

exports.insertContactDescriptions = async (
  userContactId,
  label,
  description
) => {
  const [result] = await db.query(
    `
    INSERT INTO user_contact_descriptions
      (user_contact_id, label, description)
    VALUES
      (?, ?, ?);
    `,
    [userContactId, label, description]
  );

  return result.insertId; // id of the new label
};

exports.insertDefaultDescriptions = async (
  users_id,
  label,
  description
) => {
  
  const [result] = await db.query(
    `
    INSERT INTO default_description
      (users_id, label, description)
    VALUES
      (?, ?, ?);
    `,
    [users_id, label, description]
  );

  return result.insertId; // id of the new label
};

exports.fetchDefaultDescriptions= async (userId)=>{
  
 
  const [rows] = await db.query(
      `
      SELECT
        label,description
      FROM default_description
      WHERE users_id=?
      `,
      [userId]
    );
  return rows
}