import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
    course: String,
    deadline: Date,
    goals: [String],
    status: { type: String, enum: ["active", "planning", "completed"], default: "active" },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    roles: Object,
    progress: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Project", projectSchema);
