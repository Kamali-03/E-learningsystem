
const mongoose = require("mongoose");
const { nextTick } = require("node:process");

const progressSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    }],

    completedQuizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz"
    }],

    totalLessons: {
        type: Number,
        default: 0
    },

    progressPercentage: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed"],
        default: "Not Started"
    }

}, { timestamps: true });

progressSchema.index(
    { studentId: 1, courseId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Progress", progressSchema);
