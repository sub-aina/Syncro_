import express from "express";
import { addMemberToTeam, fetchTeamWithMembers, fetchTeams } from "../controller/teamController.js";
import { createTeam } from "../controller/teamController.js";
import { verifyToken } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", verifyToken, fetchTeams);
router.post("/", verifyToken, createTeam);
router.post("/:teamId/add-member", verifyToken, addMemberToTeam);
router.get("/:teamId/details", verifyToken, fetchTeamWithMembers);
export default router;
