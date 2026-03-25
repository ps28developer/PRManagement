const app = require("../backend/app");
const { connectToDatabase } = require("../backend/db");

module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};

