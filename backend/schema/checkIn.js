import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    date: { type: Date, default: Date.now },
    workDone: String,
    hoursWorked: Number,
    mood: Number,
    energy: Number,
    blockers: [String],
    nextSteps: String,
}, { timestamps: true });

export default mongoose.model("CheckIn", checkInSchema);
