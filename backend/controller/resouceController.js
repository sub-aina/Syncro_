
import Resource from "../schema/Resource.js";
import Team from "../schema/team.js";
import { setupSocket } from "../socket.js";

export const createResource = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { title, type, url, note, tags } = req.body;
        const tagArray = tags ? tags.split(",").map((t) => t.trim()) : [];

        // console.log(" Creating resource for team:", teamId, "by user:", req.user.name);

        const resourceData = {
            team: teamId,
            title,
            type,
            tags: tagArray,
            createdBy: req.user._id, // Add the user who created the resource
        };

        if (type === "file" && req.file) {
            resourceData.file = {
                filename: req.file.originalname,
                filepath: req.file.path,
            };
        } else if (type === "link") {
            resourceData.url = url;
        } else if (type === "note") {
            resourceData.note = note;
        }

        const resource = new Resource(resourceData);
        await resource.save();

        // console.log(" Resource created successfully:", resource._id);

        //  SEND NOTIFICATIONS TO TEAM MEMBERS
        await sendResourceNotification(teamId, req.user, resource, 'created');

        res.status(201).json(resource);
    } catch (err) {
        console.error(" Failed to create resource:", err);
        res.status(500).json({ message: "Server error while creating resource" });
    }
};

export const fetchResources = async (req, res) => {
    try {
        const resources = await Resource.find({
            team: req.params.teamId,
        }).populate("createdBy", "name email");

        res.json(resources);
    } catch (err) {
        console.error(" Failed to fetch resources:", err);
        res.status(500).json({ error: "Failed to fetch resources" });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId).populate('team');
        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        const teamId = resource.team._id;
        await Resource.findByIdAndDelete(req.params.resourceId);

        console.log("🗑️ Resource deleted:", req.params.resourceId, "by user:", req.user.name);

        //  SEND DELETION NOTIFICATION TO TEAM MEMBERS
        await sendResourceNotification(teamId, req.user, resource, 'deleted');

        res.json({ message: "Resource deleted" });
    } catch (err) {
        console.error(" Failed to delete resource:", err);
        res.status(500).json({ error: "Failed to delete resource" });
    }
};

// ===== HELPER FUNCTION TO SEND RESOURCE NOTIFICATIONS =====
const sendResourceNotification = async (teamId, user, resource, action) => {
    try {
        console.log(`Sending ${action} resource notification for team:`, teamId);

        // Get the Socket.IO instance
        const io = setupSocket.io;
        if (!io) {
            console.log(" Socket.IO instance not available");
            return;
        }

        // Find team and its members
        const team = await Team.findById(teamId);
        if (!team) {
            console.log(" Team not found:", teamId);
            return;
        }

        // console.log(" Team members:", team.members.map(m => m.toString()));

        // Create notification message based on resource type and action
        let message = "";
        const resourceTypeEmoji = {
            file: "📎",
            link: "🔗",
            note: "📝"
        };

        if (action === 'created') {
            message = `${user.name} ${action === 'created' ? 'uploaded' : 'added'} a new ${resource.type} "${resource.title}" ${resourceTypeEmoji[resource.type] || "📄"}`;
        } else if (action === 'deleted') {
            message = `${user.name} deleted ${resource.type} "${resource.title}" ${resourceTypeEmoji[resource.type] || "📄"}`;
        }

        const notificationData = {
            message,
            fromUser: user._id.toString(),
            fromUserName: user.name,
            type: "resource",
            resourceType: resource.type,
            resourceTitle: resource.title,
            action: action,
            teamName: team.name,
            teamId: teamId,
            timestamp: new Date(),
        };

        // console.log(" Notification data:", notificationData);

        let notificationsSent = 0;

        // Send notification to all team members except the person who performed the action
        for (const memberId of team.members) {
            const memberIdStr = memberId.toString();
            const currentUserId = user._id.toString();

            // Skip the user who performed the action
            if (memberIdStr === currentUserId) {
                // console.log(` Skipping notification to self: ${memberIdStr}`);
                continue;
            }

            // console.log(` Attempting resource notification to user: ${memberIdStr}`);

            // Check if user is connected
            const socketsInRoom = await io.in(memberIdStr).fetchSockets();
            // console.log(` User ${memberIdStr} has ${socketsInRoom.length} active connections`);

            if (socketsInRoom.length > 0) {
                io.to(memberIdStr).emit("notification", notificationData);
                notificationsSent++;
                // console.log(` Resource notification sent to user: ${memberIdStr}`);
            } else {
                console.log(` User ${memberIdStr} is not connected (offline)`);
            }
        }

        console.log(` Resource notifications sent: ${notificationsSent}`);

    } catch (error) {
        console.error(" Error sending resource notification:", error);
    }
};
