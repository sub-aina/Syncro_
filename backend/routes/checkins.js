import express from "express";
import { verifyToken } from "../middleware/authmiddleware.js";
import checkInSchema from "../schema/checkIn.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
    try {
        const { mood, energy, nextSteps, blockers } = req.body;
        const newCheckin = new checkInSchema({
            userId: req.user.id,
            mood,
            energy,
            nextSteps,
            blockers,
            date: new Date(),
        });
        await newCheckin.save();
        res.status(201).json(newCheckin);
    } catch (err) {
        console.error("Check-in error:", err);
        res.status(500).json({ error: "Failed to submit check-in" });
    }
});

export default router;
