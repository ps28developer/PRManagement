require("dotenv").config();

const app = require("./app");
const { connectToDatabase } = require("./db");
const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
