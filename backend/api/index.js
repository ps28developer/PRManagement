const app = require("../app");
const { connectToDatabase } = require("../db");

module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};

