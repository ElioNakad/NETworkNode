const app = require("./app");
const connectMongo = require("./config/mongo");

const PORT = 3000;

// connect MongoDB
connectMongo();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});