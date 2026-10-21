const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const faqRoutes = require("./routes/faqRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const statsRoutes = require("./routes/statsRoutes");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing from environment");
  process.exit(1);
}

connectDB();

const app = express();

// Hosts like Render/Railway sit behind one proxy; without this every visitor shares one IP for rate limiting.
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Voice Assistant API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});