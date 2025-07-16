import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: String,
    courseCode: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Course", courseSchema);
