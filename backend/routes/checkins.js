import express from "express";
import { verifyToken } from "../middleware/authmiddleware.js";
import { submitCheckIn, getCheckIns } from "../controller/checkIn.js";
const router = express.Router();

router.post("/", verifyToken, submitCheckIn);
router.get("/getCheckins", verifyToken, getCheckIns);

export default router;
