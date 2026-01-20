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
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Insert description
    const [result] = await conn.query(
      `
      INSERT INTO user_contact_descriptions
        (user_contact_id, label, description)
      VALUES (?, ?, ?)
      `,
      [userContactId, label, description]
    );

    // 2️⃣ Mark embedding as dirty
    await conn.query(
      `
      UPDATE user_contact_embeddings uce
      JOIN user_contacts uc
        ON uc.user_id = uce.user_id
       AND uc.contact_id = uce.contact_id
      SET uce.needs_rebuild = 1
      WHERE uc.id = ?
      `,
      [userContactId]
    );

    await conn.commit();
    return result.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


exports.insertDefaultDescriptions = async (users_id, label, description) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Insert default description
    const [result] = await conn.query(
      `
      INSERT INTO default_description (users_id, label, description)
      VALUES (?, ?, ?)
      `,
      [users_id, label, description]
    );

    // 2️⃣ Mark embeddings dirty where THIS user appears in others' contacts
    await conn.query(
      `
      UPDATE user_contact_embeddings uce
      JOIN users u              ON u.id = ?
      JOIN contacts c           ON c.phone = u.phone
      JOIN user_contacts uc     ON uc.contact_id = c.id
                               AND uc.user_id = uce.user_id
                               AND uc.contact_id = uce.contact_id
      SET uce.needs_rebuild = 1
      `,
      [users_id]
    );

    await conn.commit();
    return result.insertId;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


exports.fetchDefaultDescriptions= async (userId)=>{
  const [rows] = await db.query(
      `
      SELECT
        label,description,id
      FROM default_description
      WHERE users_id=?
      `,
      [userId]
    );
  return rows
}

exports.fetchDefaultDescriptionsForContact = async (viewerUserId, phone) => {
  const [rows] = await db.query(
    `
    SELECT
      dd.id,
      dd.label,
      dd.description
    FROM user_contacts uc
    JOIN contacts c ON c.id = uc.contact_id
    JOIN users u ON u.phone = c.phone
    JOIN default_description dd ON dd.users_id = u.id
    WHERE uc.user_id = ?
      AND c.phone = ?
    `,
    [viewerUserId, phone]
  );

  return rows;
};


exports.deleteManualDescription = async (id) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Get user_contact_id BEFORE delete
    const [[row]] = await conn.query(
      `SELECT user_contact_id FROM user_contact_descriptions WHERE id = ?`,
      [id]
    );

    if (!row) {
      await conn.rollback();
      return 0;
    }

    const userContactId = row.user_contact_id;

    // 2️⃣ Delete description
    const [result] = await conn.query(
      `DELETE FROM user_contact_descriptions WHERE id = ?`,
      [id]
    );

    // 3️⃣ Mark embedding dirty
    await conn.query(
      `
      UPDATE user_contact_embeddings uce
      JOIN user_contacts uc
        ON uc.user_id = uce.user_id
       AND uc.contact_id = uce.contact_id
      SET uce.needs_rebuild = 1
      WHERE uc.id = ?
      `,
      [userContactId]
    );

    await conn.commit();
    return result.affectedRows;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
exports.deleteDefaultDescription = async (id) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Get users_id BEFORE delete
    const [[row]] = await conn.query(
      `SELECT users_id FROM default_description WHERE id = ?`,
      [id]
    );

    if (!row) {
      await conn.rollback();
      return 0;
    }

    const usersId = row.users_id;

    // 2️⃣ Delete default description
    const [result] = await conn.query(
      `DELETE FROM default_description WHERE id = ?`,
      [id]
    );

    // 3️⃣ Mark embeddings dirty where this user appears in contacts
    await conn.query(
      `
      UPDATE user_contact_embeddings uce
      JOIN users u          ON u.id = ?
      JOIN contacts c       ON c.phone = u.phone
      JOIN user_contacts uc ON uc.contact_id = c.id
                           AND uc.user_id = uce.user_id
                           AND uc.contact_id = uce.contact_id
      SET uce.needs_rebuild = 1
      `,
      [usersId]
    );

    await conn.commit();
    return result.affectedRows;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
