import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    studentId: String,
    major: String,
    year: Number,
    role: { type: String, enum: ["student", "instructor"], default: "student" },
    password: {
        type: String,
        required: true,
        select: false,
    },
    avatar: {
        type: [String], // Array of color hex codes
        default: ['#FF6B6B', '#FFFFFF'], // Default color scheme
        validate: {
            validator: function (colors) {
                return colors.length === 2 &&
                    colors.every(color => /^#[0-9A-F]{6}$/i.test(color));
            },
            message: 'Avatar must be an array of 2 valid hex colors'
        }
    },
});

export default mongoose.model("User", userSchema);
