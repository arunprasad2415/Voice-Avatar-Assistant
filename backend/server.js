const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const faqRoutes = require("./routes/faqRoutes");
const voiceRoutes = require("./routes/voiceRoutes");

dotenv.config();
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Voice Assistant API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/voice", voiceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});