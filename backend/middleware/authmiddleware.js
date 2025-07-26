import jwt from "jsonwebtoken";
import User from "../schema/user.js"; // Make sure this path matches your User model

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Token must be in format: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Decode the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(" Token decoded - User ID:", decoded.id);

        // Fetch the full user object from the database
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log(" User not found in database for ID:", decoded.id);
            return res.status(401).json({ error: "User not found" });
        }

        // console.log(" User found:", {
        //     id: user._id,
        //     name: user.name,
        //     email: user.email
        // });

        // Attach the full user object to the request
        req.user = user;
        next(); // Go to the next middleware/route

    } catch (err) {
        console.error(" Token verification error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};