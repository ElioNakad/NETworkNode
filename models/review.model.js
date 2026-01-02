const db = require("../config/db");

exports.insertReview=async(user_id,default_description_id,review)=>{
  const [res] = await db.query(
    "INSERT INTO reviews (reviewer_id, default_description_id, review) VALUES (?, ?, ?)",
    [user_id,default_description_id,review]
  );
  return res.insertId;
}

exports.fetchReviews = async (default_description_id) => {
  const sql = `
    SELECT
      r.id            AS review_id,
      r.review        AS review_text,

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
