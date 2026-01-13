exports.upsertProfileOnly = async (
  conn,
  userId,
  contactId,
  embeddingJson,
  contextHash,
  profileText
) => {
  await conn.query(
    `
    INSERT INTO user_contact_embeddings
      (user_id, contact_id, embedding, context_hash, profile_text, needs_rebuild)
    VALUES (?, ?, ?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE
      embedding = VALUES(embedding),
      context_hash = VALUES(context_hash),
      profile_text = VALUES(profile_text),
      needs_rebuild = 1
    `,
    [userId, contactId, embeddingJson, contextHash, profileText]
  );
};
