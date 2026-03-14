const db = require("../config/db");
const Review = require("../mongoModel/Review");
/*exports.insertReview = async (reviewer_id, default_description_id, review) => {
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
}; */
exports.insertReview = async (reviewer_id, default_description_id, review) => {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    // 1️⃣ Insert review into MongoDB
    const mongoReview = await Review.create({
      reviewer_id,
      default_description_id,
      review
    });

    // 2️⃣ Keep embedding logic (MySQL)
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

    return mongoReview._id;

  } catch (err) {

    await conn.rollback();
    throw err;

  } finally {

    conn.release();

  }
};

/*exports.fetchReviews = async (default_description_id) => {
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
};*/
exports.fetchReviews = async (default_description_id) => {

  // 1️⃣ Fetch reviews from MongoDB
  const reviews = await Review.find({
    default_description_id: default_description_id
  }).sort({ _id: -1 });

  if (reviews.length === 0) return [];

  // 2️⃣ Get reviewer IDs
  const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))];

  // 3️⃣ Fetch user info from MySQL
  const placeholders = reviewerIds.map(() => "?").join(",");
  const sql = `
      SELECT id, fname, lname, email
      FROM users
      WHERE id IN (${placeholders})
  `;

  const [users] = await db.query(sql, reviewerIds);

  // 4️⃣ Create map for fast lookup
  const userMap = {};
  users.forEach(u => {
    userMap[u.id] = u;
  });

  // 5️⃣ Merge data
  const result = reviews.map(r => ({
    review_id: r._id,
    review_text: r.review,
    review_date: r.created_at,

    reviewer_id: r.reviewer_id,
    reviewer_fname: userMap[r.reviewer_id]?.fname || null,
    reviewer_lname: userMap[r.reviewer_id]?.lname || null,
    reviewer_email: userMap[r.reviewer_id]?.email || null
  }));

  return result;
};
/*exports.deleteReview = async (review_id, reviewer_id) => {
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
};*/

exports.deleteReview = async (review_id, reviewer_id) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const review = await Review.findOne({
      _id: review_id,
      reviewer_id: reviewer_id
    });

    if (!review) {
      await conn.rollback();
      return 0;
    }

    const defaultDescriptionId = review.default_description_id;

    await Review.deleteOne({
      _id: review_id,
      reviewer_id: reviewer_id
    });

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
    [defaultDescriptionId]
    );

    await conn.commit();
    return 1;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
