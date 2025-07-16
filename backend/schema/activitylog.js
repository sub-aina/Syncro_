import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    details: Object,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ActivityLog", activityLogSchema);
