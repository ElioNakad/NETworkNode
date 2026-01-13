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
