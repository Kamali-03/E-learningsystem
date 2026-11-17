
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({

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

    status: {
        type: String,
        enum: ["Pending", "Enrolled", "Rejected"],
        default: "Pending"
    },

    enrolledAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

enrollmentSchema.index(
    { studentId: 1, courseId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
