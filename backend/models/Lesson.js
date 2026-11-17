
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    videoUrl: {
        type: String,
        default: ""
    },

    materialUrl: {
        type: String,
        default: ""
    },

    order: {
        type: Number,
        default: 1
    }

}, { timestamps: true });

module.exports = mongoose.model("Lesson", lessonSchema);
