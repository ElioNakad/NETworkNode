const db = require("../config/db");

exports.insertReview = async (reviewer_id, default_description_id, review) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Insert the review
    const [res] = await conn.query(
      `
      INSERT INTO reviews (reviewer_id, default_description_id, review)
      VALUES (?, ?, ?)
      `,
      [reviewer_id, default_description_id, review]
    );

    // 2️⃣ Mark embeddings dirty using PHONE identity
    await conn.query(
      `
      UPDATE user_contact_embeddings uce
      JOIN contacts c
        ON c.id = uce.contact_id
      JOIN users u
        ON u.phone = c.phone
      JOIN default_description dd
        ON dd.users_id = u.id
      SET uce.needs_rebuild = 1
      WHERE dd.id = ?
      `,
      [default_description_id]
    );

    await conn.commit();
    return res.insertId;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.fetchReviews = async (default_description_id) => {
  const sql = `
    SELECT
      r.id            AS review_id,
      r.review        AS review_text,
      r.created_at    AS review_date,

      u.id            AS reviewer_id,
      u.fname         AS reviewer_fname,
      u.lname         AS reviewer_lname,
      u.email         AS reviewer_email
    FROM reviews r
    JOIN users u
      ON r.reviewer_id = u.id
    WHERE r.default_description_id = ?
    ORDER BY r.id DESC
  `;

  const [rows] = await db.query(sql, [default_description_id]);
  return rows;
};

exports.deleteReview = async (review_id, reviewer_id) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Get the OWNER of the reviewed profile (the impacted user)
    const [[row]] = await conn.query(
      `
      SELECT dd.users_id AS target_user_id
      FROM reviews r
      JOIN default_description dd
        ON r.default_description_id = dd.id
      WHERE r.id = ? AND r.reviewer_id = ?
      `,
      [review_id, reviewer_id]
    );

    if (!row) {
      // Either review doesn't exist or user is not the owner
      await conn.rollback();
      return 0;
    }

    const targetUserId = row.target_user_id;

    // 2️⃣ Delete the review
    const [delRes] = await conn.query(
      `
      DELETE FROM reviews
      WHERE id = ? AND reviewer_id = ?
      `,
      [review_id, reviewer_id]
    );

    if (delRes.affectedRows === 0) {
      await conn.rollback();
      return 0;
    }

    // 3️⃣ Mark ALL embeddings of the impacted user as dirty
    await conn.query(
      `
      UPDATE user_contact_embeddings
      SET needs_rebuild = 1
      WHERE user_id = ?
      `,
      [targetUserId]
    );

    await conn.commit();
    return delRes.affectedRows;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
