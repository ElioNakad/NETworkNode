const axios = require("axios");

const VECTOR_SERVICE_URL =
  process.env.VECTOR_SERVICE_URL || "http://127.0.0.1:5001";

const triggerDirtyContactVectorRebuild = ({
  limit = 100,
  embeddingIds = null,
} = {}) => {
  const params = new URLSearchParams();
  const ids = Array.isArray(embeddingIds)
    ? embeddingIds.filter((id) => id !== null && id !== undefined)
    : [];

  params.append("limit", String(Math.min(Math.max(limit, ids.length || 1), 500)));

  for (const id of ids) {
    params.append("embedding_ids", String(id));
  }

  axios
    .post(`${VECTOR_SERVICE_URL}/rebuild-dirty-contact-vectors?${params}`)
    .then((response) => {
      console.log("Dirty contact vector rebuild triggered:", response.data);
    })
    .catch((err) => {
      console.log("Dirty contact vector rebuild error:", err.message);
    });
};

module.exports = {
  triggerDirtyContactVectorRebuild,
};
