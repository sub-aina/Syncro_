import API from "../api";

export const addTeamMember = async (projectId, studentId) => {
    const token = localStorage.getItem("token");

    try {
        const response = await API.post(
            `/projects/${projectId}/add-member`,
            { studentId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("API ERROR:", error?.response?.data);
        throw error.response?.data || { error: "Failed to add team member" };
    }
}
