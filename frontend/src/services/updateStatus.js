import API from "../api";

export const updateStatus = async (projectId, newStatus) => {
    const token = localStorage.getItem("token");
    const response = await API.patch(`/projects/${projectId}/status`, { status: newStatus }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
