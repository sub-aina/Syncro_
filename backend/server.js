import express from "express"; //handle HTTP requests
import cors from "cors";  // Cross-Origin Resource Sharing
import mongoose from "mongoose"; // MongoDB
import dotenv from "dotenv";  // Environment variables
import authRoutes from "./routes/auth.js"; // Import authentication routes
import projectRoutes from "./routes/project.js";
import checkInRoutes from "./routes/checkins.js"; // Import check-in routes
import teamRoutes from "./routes/team.js"; // Import team routes
import resourceRoutes from "./routes/resources.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import * as path from 'path'; // For serving static files
dotenv.config();

const app = express(); // Create an Express application
app.use(cors()); // Enable CORS for all routes

app.use(express.json()); // Parse JSON bodies

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/checkins", checkInRoutes);
app.use("/api/teams", teamRoutes);

app.use("/api/resources", resourceRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use("/uploads", express.static("uploads"));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log(" Connected to MongoDB");
        app.listen(process.env.PORT || 5000, () => {
            console.log(` Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => {
        console.error(" MongoDB connection failed:", err.message);
    });
