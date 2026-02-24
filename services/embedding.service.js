const crypto = require("crypto");
const embeddingModel = require("../models/embedding.model");

const hashText = (text) =>
  crypto.createHash("sha256").update(text).digest("hex");

// Build minimal profile text at SIGNUP (no AI, no labels yet)
exports.buildSignupProfileText = ({ displayName, phone, defaultLabel }) => {
  return `
CONTACT:
Name: ${displayName || "Unknown"}
Phone: ${phone}

DEFAULT IDENTITY:
${defaultLabel || "None"}

MY PERSONAL LABELS:
None yet

CV:
None

REVIEWS:
None
`.trim();
};

// Store profile_text and mark needs_rebuild=1 (no real embeddings yet)
exports.createProfileSnapshotForSignup = async (
  conn,
  userId,
  contactId,
  { displayName, phone, defaultLabel }
) => {
  const profileText = exports.buildSignupProfileText({
    displayName,
    phone,
    defaultLabel,
  });

  const contextHash = hashText(profileText);

  // Because embedding column is NOT NULL, we store a valid JSON placeholder.
  const placeholderEmbeddingJson = JSON.stringify([]);

  await embeddingModel.upsertProfileOnly(
    conn,
    userId,
    contactId,
    placeholderEmbeddingJson,
    contextHash,
    profileText
  );
};

exports.updateNameInProfileSnapshot = async (
  conn,
  userId,
  contactId,
  newDisplayName
) => {

  // 1️⃣ Get current snapshot
  const [rows] = await conn.query(
    `
    SELECT profile_text
    FROM user_contact_embeddings
    WHERE user_id = ? AND contact_id = ?
    `,
    [userId, contactId]
  );

  if (!rows.length) return;

  let profileText = rows[0].profile_text;

  // 2️⃣ Replace ONLY the Name line
  profileText = profileText.replace(
    /Name:\s*.*/,
    `Name: ${newDisplayName}`
  );

  // 3️⃣ Recompute hash
  const contextHash = hashText(profileText);

  // 4️⃣ Update snapshot without touching other fields
  await conn.query(
    `
    UPDATE user_contact_embeddings
    SET profile_text = ?,
        context_hash = ?,
        needs_rebuild = 1
    WHERE user_id = ? AND contact_id = ?
    `,
    [profileText, contextHash, userId, contactId]
  );
};