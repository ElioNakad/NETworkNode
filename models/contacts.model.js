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