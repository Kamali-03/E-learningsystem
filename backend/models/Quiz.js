
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    },

    title: {
        type: String,
        required: true
    },

    questions: [{
        question: {
            type: String,
            required: true
        },

        options: [{
            type: String
        }],

        correctAnswer: {
            type: String,
            required: true
        }
    }]

}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
