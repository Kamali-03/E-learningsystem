
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// User routes
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
// Home route
app.get("/", (req, res) => {
    res.json({
        message: "E-Learning Backend is Running"
    });
});

// Health route
app.get("/api/health", (req, res) => {
    res.json({
        message: "Backend is working",
        database: mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
    });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.log("MongoDB Error:", error.message);
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
