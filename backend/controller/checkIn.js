
import checkIn from "../schema/checkIn.js";
import Project from "../schema/project.js";
import team from "../schema/team.js";

export const submitCheckIn = async (req, res, io) => {
    // console.log("CHECKIN API CALLED - Starting submission process");
    // console.log(" Request body:", req.body);
    // console.log(" Request headers:", req.headers);
    // console.log(" Authorization header:", req.headers.authorization);
    // console.log(" Request user (full object):", req.user);
    // console.log(" Request user type:", typeof req.user);

    // Check if req.user exists at all
    if (!req.user) {
        // console.log(" ERROR: req.user is null/undefined - authentication middleware failed!");
        return res.status(401).json({ error: "Authentication failed - no user data" });
    }

    try {
        const { mood, energy, nextSteps, blockers } = req.body;

        // Handle both _id and id properties from req.user
        const currentUserId = req.user._id?.toString() || req.user.id?.toString();

        // console.log(" Check-in submission for user:", currentUserId, "Name:", req.user.name);

        // If still undefined, there's an issue with user object structure
        if (!currentUserId) {
            // console.log(" ERROR: Cannot extract user ID from req.user");
            // console.log(" req.user keys:", Object.keys(req.user || {}));
            return res.status(400).json({ error: "Invalid user data - no ID found" });
        }

        const newCheckin = new checkIn({
            userId: currentUserId,
            mood,
            energy,
            nextSteps,
            blockers,
            date: new Date(),
        });

        // console.log(" New check-in object created:", newCheckin);


        const userObjectId = req.user._id || req.user.id;
        // console.log("🔍 Searching for teams with user ObjectId:", userObjectId);

        const teams = await team.find({ members: userObjectId });
        // console.log(`Found ${teams.length} teams for user ${currentUserId}`);

        // if (teams.length > 0) {
        //     // teams.forEach((t, index) => {
        //     //     // console.log(` Team ${index + 1}:`, {
        //     //     //     id: t._id,
        //     //     //     name: t.name,
        //     //     //     members: t.members.map(m => m.toString())
        //     //     // });
        //     // });
        // } else {
        //     console.log(" User is not in any teams, no notifications to send");
        // }

        const notifiedUserIds = new Set();
        let notificationsSent = 0;

        for (const teamObj of teams) {

            for (const memberId of teamObj.members) {
                const memberIdStr = memberId.toString();

                // Skip the user who submitted the check-in
                if (memberIdStr === currentUserId) {
                    // console.log(` Skipping notification to self: ${memberIdStr}`);
                    continue;
                }

                // Skip if already notified
                if (notifiedUserIds.has(memberIdStr)) {
                    // console.log(` Already notified user: ${memberIdStr}`);
                    continue;
                }

                // console.log(` Attempting notification to user: ${memberIdStr}`);

                const notificationData = {
                    message: `${req.user.name || "A teammate"} just checked in.`,
                    fromUser: currentUserId,
                    fromUserName: req.user.name,
                    type: "checkin",
                    timestamp: new Date(),
                    teamName: teamObj.name
                };

                // console.log(" Notification data:", notificationData);

                // Check if user is connected
                try {
                    const socketsInRoom = await io.in(memberIdStr).fetchSockets();
                    console.log(`🔍 User ${memberIdStr} has ${socketsInRoom.length} active connections`);

                    if (socketsInRoom.length > 0) {
                        io.to(memberIdStr).emit("notification", notificationData);
                        notificationsSent++;
                        console.log(` Notification sent to user: ${memberIdStr}`);
                    } else {
                        console.log(` User ${memberIdStr} is not connected (offline)`);
                    }
                } catch (socketError) {
                    console.error(` Socket error for user ${memberIdStr}:`, socketError);
                }

                notifiedUserIds.add(memberIdStr);
            }
        }

        await newCheckin.save();
        // console.log(` Check-in saved successfully. Notifications sent: ${notificationsSent}`);

        res.status(201).json({
            success: true,
            checkin: newCheckin,
            notifiedUsers: Array.from(notifiedUserIds),
            notificationsSent: notificationsSent,
            teamsFound: teams.length
        });

    } catch (err) {
        console.error(" Check-in error:", err);
        console.error(" Error stack:", err.stack);
        res.status(500).json({ error: "Failed to submit check-in", details: err.message });
    }
};

export const getCheckIns = async (req, res) => {
    try {
        const userId = req.user._id;
        const checkins = await checkIn.find({ userId }).sort({ createdAt: -1 });
        res.json(checkins);
    } catch (err) {
        console.error(" Error fetching check-ins:", err);
        res.status(500).json({ error: "Failed to fetch check-ins" });
    }
};
