require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ======================
// 📌 Player Schema & Model
// ======================
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bestHeight: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const Player = mongoose.model("Player", playerSchema);

// ======================
// 📌 Routes
// ======================

// ✅ Submit or update score
app.post("/submit-score", async (req, res) => {
  try {
    const { name, bestHeight } = req.body;

    if (!name || bestHeight === undefined) {
      return res.status(400).json({ error: "Name and bestHeight are required" });
    }

    let player = await Player.findOne({ name });

    if (player) {
      // Update only if new height is higher
      if (bestHeight > player.bestHeight) {
        player.bestHeight = bestHeight;
        await player.save();
      }
    } else {
      // Create new player
      player = new Player({ name, bestHeight });
      await player.save();
    }

    res.json({ success: true, player });
  } catch (err) {
    console.error("❌ Error submitting score:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get leaderboard (sorted by bestHeight)
app.get("/leaderboard", async (req, res) => {
  try {
    const players = await Player.find().sort({ bestHeight: -1 }).limit(50);
    res.json(players);
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// 📌 Start Server
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
