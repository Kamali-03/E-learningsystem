
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    instructor: {
        type: String,
        default: "Staff"
    },

    duration: {
        type: String,
        default: "Self-paced"
    },

    image: {
        type: String,
        default: ""
    },

    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    }]

}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
