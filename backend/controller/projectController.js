import Project from "../schema/project.js";
import User from "../schema/user.js";

export const CreateProject = async (req, res) => {
    try {
        const { name, description, course, deadline, goals } = req.body;
        const userId = req.user;

        const newProject = new Project({
            name, description, course, deadline, goals,
            createdBy: userId, teamMembers: [userId],
        });

        await newProject.save();
        res.status(201).json({ message: "Project created", project: newProject });
    } catch (err) {
        res.status(500).json({ error: "Error creating project" });
    }
};

export const getProjects = async (req, res) => {
    try {
        const userId = req.user;

        const projects = await Project.find({ teamMembers: userId }).populate("teamMembers", "name studentId");
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch projects" });
    }
}
export const updateProjectStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const updated = await Project.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ message: "Status updated", project: updated });
    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
};

export const addTeamMember = async (req, res) => {
    try {
        const { studentId } = req.body;
        const { projectId } = req.params;

        console.log("➤ Received studentId:", studentId);
        console.log("➤ Project ID:", projectId);

        const user = await User.findOne({ studentId });
        if (!user) {
            console.log(" No user found with this studentId");
            return res.status(404).json({ error: "User not found" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            console.log(" No project found with this ID");
            return res.status(404).json({ error: "Project not found" });
        }

        if (project.teamMembers.includes(user._id)) {
            console.log(" User already in team");
            return res.status(400).json({ error: "User already in team" });
        }
        if (project.status == "completed") {
            console.log(" Cannot add member to completed project");
            return res.status(400).json({ error: "Cannot add member to completed project" });
        }

        project.teamMembers.push(user._id);
        await project.save();

        console.log(" Member added successfully");
        res.json({ message: "Member added", project });
    } catch (err) {
        console.error(" Server error:", err);
        res.status(500).json({ error: "Failed to add team member" });
    }
};
