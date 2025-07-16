import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed,
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Setting", settingSchema);
