
import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["link", "file", "note"],
            required: true,
        },
        url: {
            type: String, // only for type === 'link'
        },
        note: {
            type: String, // only for type === 'note'
        },
        file: {
            filename: String,
            filepath: String,
        },
        tags: [String],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
