
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// STUDENT REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student"
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});


// STUDENT AND STAFF LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});


// SAVE STUDENT PROGRESS
router.put("/progress/:id", async (req, res) => {
  try {
    const { progress } = req.body;

    if (!progress || typeof progress !== "object") {
      return res.status(400).json({
        message: "Valid progress data is required"
      });
    }

    const student = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student"
      },
      {
        $set: { progress: progress }
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Progress saved successfully",
      progress: student.progress
    });

  } catch (error) {
    res.status(500).json({
      message: "Error saving progress",
      error: error.message
    });
  }
});


// GET INDIVIDUAL STUDENT PROGRESS
router.get("/progress/:id", async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student"
    }).select("name email progress");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(student);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching progress",
      error: error.message
    });
  }
});


// GET ALL STUDENTS WITH THEIR PROGRESS
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({
      role: "student"
    })
      .select("name email role progress createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "Students fetched successfully",
      totalStudents: students.length,
      students: students
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching students",
      error: error.message
    });
  }
});


// DELETE STUDENT FROM MONGODB
router.delete("/students/:id", async (req, res) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student"
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting student",
      error: error.message
    });
  }
});


// EXPORT ROUTER
module.exports = router;
