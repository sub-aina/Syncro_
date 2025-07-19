import checkIn from "../schema/checkIn.js";

export const submitCheckIn = async (req, res) => {
    try {
        const { mood, energy, nextSteps, blockers } = req.body;
        const newCheckin = new checkIn({
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
};

export const getCheckIns = async (req, res) => {
    try {
        const userId = req.user._id;
        const checkins = await checkIn.find({ userId }).sort({ createdAt: -1 });
        res.json(checkins);
    } catch (err) {
        console.error("Error fetching check-ins:", err);
        res.status(500).json({ error: "Failed to fetch check-ins" });
    }
};
