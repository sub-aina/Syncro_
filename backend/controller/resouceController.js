import Resource from "../schema/Resource.js";

export const createResource = async (req, res) => {
    try {

        const { teamId } = req.params;

        const { title, type, url, note, tags } = req.body;
        const tagArray = tags ? tags.split(",").map((t) => t.trim()) : [];

        const resourceData = {
            team: teamId,
            title,
            type,
            tags: tagArray,
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
        res.status(500).json({ error: "Failed to fetch resources" });
    }
};


export const deleteResource = async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.resourceId);
        res.json({ message: "Resource deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete resource" });
    }
};
