import User from "../schema/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "secret123";

//reg new user
export const register = async (req, res) => {
    try {
        const { name, email, studentId, major, year, role, password, avatar } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            studentId,
            major,
            year,
            role,
            password: hashedPassword,
            avatar: avatar || ['#FF6B6B', '#FFFFFF'], // Use selected avatar or default
        });

        await user.save();


        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "2d" }
        );


        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                major: user.major,
                year: user.year,
                avatar: avatar || ['#FF6B6B', '#FFFFFF'], // Use selected avatar or default
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//login user

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2d" });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                major: user.major,
                year: user.year,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
