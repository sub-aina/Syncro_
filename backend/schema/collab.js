import mongoose from "mongoose";

const collabSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    interactionCount: Number,
    lastInteraction: Date,
});

export default mongoose.model("Collaboration", collabSchema);
