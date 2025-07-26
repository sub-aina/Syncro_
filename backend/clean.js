// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "./schema/user.js";
// import Project from "./schema/project.js";
// import Team from "./schema/team.js";
// import CheckIn from "./schema/checkIn.js";
// import Resource from "./schema/Resource.js";

import { login } from "./controller/authController.js"

// dotenv.config();

// async function cleanupDB() {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("Connected to MongoDB");


//         await User.deleteMany({});
//         await Project.deleteMany({});
//         await Team.deleteMany({});
//         await CheckIn.deleteMany({});
//         await Resource.deleteMany({});

//         console.log("Dummy data removed ");
//         process.exit();
//     } catch (err) {
//         console.error("Cleanup failed ", err);
//         process.exit(1);
//     }
// }

// cleanupDB();


// // team when added auto resfresh
// // after sign in goes to login
// dashboard take too long
// // after projects goes to dashboard
