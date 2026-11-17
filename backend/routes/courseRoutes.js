
const express = require("express");
const router = express.Router();

const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// Get all courses
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find().populate("lessons");
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add course with lessons
router.post("/", async (req, res) => {
    try {
       const { title, category, description, instructor, duration, image, lessons } = req.body;

      const course = new Course({
    title,
    category,
    description,
    instructor,
    duration,
    image
});
        const savedCourse = await course.save();

        const lessonDocs = await Lesson.insertMany(
            (lessons || []).map((lesson, index) => ({
                courseId: savedCourse._id,
                title: typeof lesson === "string" ? lesson : lesson.title,
                description: typeof lesson === "string" ? "" : lesson.description || "",
                order: index + 1
            }))
        );

        savedCourse.lessons = lessonDocs.map(lesson => lesson._id);
        await savedCourse.save();

        res.status(201).json(
            await Course.findById(savedCourse._id).populate("lessons")
        );
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete course and its lessons
router.delete("/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        await Lesson.deleteMany({ courseId: course._id });

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
