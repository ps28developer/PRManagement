const app = require("../backend/app");
const { connectToDatabase } = require("../backend/db");

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (err) {
    console.error("API handler crashed:", err);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "Serverless function initialization failed",
        message: err?.message || String(err),
      })
    );
  }
};

