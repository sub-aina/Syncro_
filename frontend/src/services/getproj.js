import API from "../api";

export const getProjects = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await API.get("/projects", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Could not fetch projects" };
    }

}