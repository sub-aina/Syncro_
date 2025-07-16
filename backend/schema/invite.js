import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    sentAt: { type: Date, default: Date.now },
});

export default mongoose.model("Invitation", invitationSchema);
