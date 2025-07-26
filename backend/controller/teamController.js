import Team from "../schema/team.js";
import User from "../schema/user.js";

export const addMemberToTeam = async (req, res) => {
    const { teamId } = req.params;
    const { identifier } = req.body; // identifier can be studentId or email

    if (!identifier) {
        return res.status(400).json({ error: "Identifier is required" });
    }

    try {
        const user = await User.findOne({
            $or: [
                { studentId: identifier },
                { email: identifier }
            ]
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        //Find team
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        // Check if user is already in the team
        const alreadyMember = team.members.includes(user._id);
        if (alreadyMember) return res.status(400).json({ message: "User already in team." });

        // Add user to team
        team.members.push(user._id);
        await team.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            studentId: user.studentId,
        });

    } catch (error) {
        console.error("Error adding member to team:", error);
        res.status(500).json({ message: "Failed to add member", error: error.message });
    }
}

export const createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user;

        const newTeam = new Team({
            name, description,
            createdBy: userId, members: [userId],
        });
        await newTeam.save();
        res.status(201).json({ message: "Team created", team: newTeam });
    } catch (err) {
        res.status(500).json({ error: "Error creating Team" });
    }
}

export const fetchTeamWithMembers = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId)
            .populate("members", "name email studentId ")
            .populate("createdBy", "name email studentId");

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.status(200).json({
            team: {
                _id: team._id,
                name: team.name,
                description: team.description,
                createdBy: team.createdBy,
                members: team.members,
            },
        });
    } catch (error) {
        console.error("Error fetching team with members:", error);
        res.status(500).json({ message: "Failed to fetch team details", error: error.message });
    }
};
export const fetchTeams = async (req, res) => {
    try {
        const userId = req.user;

        // Find teams where user is either creator or member

        console.log("fetchTeams userId:", userId);
        const teams = await Team.find({
            $or: [
                { createdBy: userId },
                { members: userId }
            ]
        })

            .populate("createdBy", "name email studentId")
            .populate("members", "name email studentId")
            .sort({ createdAt: -1 });


        console.log("Found teams:", teams);

        res.status(200).json({
            teams: teams.map(team => ({
                _id: team._id,
                name: team.name,
                description: team.description,
                createdBy: team.createdBy,
                memberCount: team.members.length,
                createdAt: team.createdAt
            }))
        });


    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ message: "Failed to fetch teams", error: error.message });
    }
};

