const db = require("../config/db");
const Review = require("../mongoModel/Review");

const fetchEmbeddingIdsForDefaultDescription = async (
  conn,
  defaultDescriptionId
) => {
  const [rows] = await conn.query(
    `
    SELECT uce.id
    FROM user_contact_embeddings uce
    JOIN contacts c
      ON c.id = uce.contact_id
    JOIN users u
      ON u.phone = c.phone
    JOIN default_description dd
      ON dd.users_id = u.id
    WHERE dd.id = ?
    `,
    [defaultDescriptionId]
  );

  return rows.map((row) => row.id);
};

exports.insertReview = async (reviewer_id, default_description_id, review) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const mongoReview = await Review.create({
      reviewer_id,
      default_description_id,
      review,
    });

    const embeddingIds = await fetchEmbeddingIdsForDefaultDescription(
      conn,
      default_description_id
    );

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

    return {
      id: mongoReview._id,
      embeddingIds,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.fetchReviews = async (default_description_id) => {
  const reviews = await Review.find({
    default_description_id: default_description_id,
  }).sort({ _id: -1 });

  if (reviews.length === 0) return [];

  const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id))];
  const placeholders = reviewerIds.map(() => "?").join(",");
  const sql = `
    SELECT id, fname, lname, email
    FROM users
    WHERE id IN (${placeholders})
  `;

  const [users] = await db.query(sql, reviewerIds);

  const userMap = {};
  users.forEach((u) => {
    userMap[u.id] = u;
  });

  return reviews.map((r) => ({
    review_id: r._id,
    review_text: r.review,
    review_date: r.created_at,
    reviewer_id: r.reviewer_id,
    reviewer_fname: userMap[r.reviewer_id]?.fname || null,
    reviewer_lname: userMap[r.reviewer_id]?.lname || null,
    reviewer_email: userMap[r.reviewer_id]?.email || null,
  }));
};

exports.deleteReview = async (review_id, reviewer_id) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const review = await Review.findOne({
      _id: review_id,
      reviewer_id: reviewer_id,
    });

    if (!review) {
      await conn.rollback();
      return 0;
    }

    const defaultDescriptionId = review.default_description_id;
    const embeddingIds = await fetchEmbeddingIdsForDefaultDescription(
      conn,
      defaultDescriptionId
    );

    await Review.deleteOne({
      _id: review_id,
      reviewer_id: reviewer_id,
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

    return {
      affectedRows: 1,
      embeddingIds,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
