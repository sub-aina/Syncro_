import express from "express";
import { CreateProject } from "../controller/projectController.js";
import { verifyToken } from "../middleware/authmiddleware.js";
import { getProjects } from "../controller/projectController.js";
import { updateProjectStatus } from "../controller/projectController.js";
import { addTeamMember } from "../controller/projectController.js";
const router = express.Router();
router.post("/create", verifyToken, CreateProject);
router.get("/", verifyToken, getProjects);
router.patch("/:id/status", verifyToken, updateProjectStatus);
router.post("/:projectId/add-member", verifyToken, addTeamMember);

export default router;