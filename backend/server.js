// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import http from "http";
// import { Server } from "socket.io";
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import path from 'path';

// import authRoutes from "./routes/auth.js";
// import projectRoutes from "./routes/project.js";
// import checkInRoutes from "./routes/checkins.js";
// import teamRoutes from "./routes/team.js";
// import resourceRoutes from "./routes/resources.js";
// import { setupSocket } from "./socket.js";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// const server = http.createServer(app);

// //  Setup Socket.IO once
// const io = new Server(server, {
//     cors: {
//         origin: [
//             'http://localhost:3000',
//             'http://localhost:5173',
//             'http://localhost:4173',
//             'https://syncro-delta.vercel.app'
//         ],
//         credentials: true,
//         methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//         allowedHeaders: ['Content-Type', 'Authorization']
//     }
// });
// setupSocket(io); // pass io once

// // Middlewares
// app.use(cors({
//     origin: [
//         'http://localhost:3000',
//         'http://localhost:5173',
//         'http://localhost:4173',
//         'https://syncro-delta.vercel.app'
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/checkins", checkInRoutes(io)); // Only pass io once
// app.use("/api/teams", teamRoutes);
// app.use("/api/resources", resourceRoutes);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // MongoDB & Server Start
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log(" Connected to MongoDB");
//         server.listen(process.env.PORT || 5000, () => {
//             console.log(` Server running on port ${process.env.PORT || 5000}`);
//         });
//     })
//     .catch((err) => {
//         console.error(" MongoDB connection failed:", err.message);
//     });
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import checkInRoutes from "./routes/checkins.js";
import teamRoutes from "./routes/team.js";
import resourceRoutes from "./routes/resources.js";
import { setupSocket } from "./socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = setupSocket(server);

// Middlewares
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4173',
        'https://syncro-delta.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/checkins", checkInRoutes(io));
app.use("/api/teams", teamRoutes);
app.use("/api/resources", resourceRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB & Server Start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        server.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => {
        console.error(" MongoDB connection failed:", err.message);
    });