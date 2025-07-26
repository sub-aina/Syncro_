import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who should receive
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who triggered
    message: String,
    type: String, // checkin, upload, etc
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
