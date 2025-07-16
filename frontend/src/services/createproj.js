import API from "../api";

export const createProject = async (projectData) => {
    try {
        const response = await API.post("/projects/create", projectData);
        return response.data;
    } catch (err) {
        console.error("API ERROR:", err.response?.data || err.message);
        throw err.response?.data || { error: "Unknown error" };
    }
};
