import API from "../api";

export const newTeamMember = async (teamId, identifier) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error('Authentication token not found');
    }

    if (!teamId) {
        throw new Error('Team ID is required');
    }

    if (!identifier) {
        throw new Error('Member identifier is required');
    }
    try {
        const response = await API.post(
            `/teams/${teamId}/add-member`,
            { identifier: identifier.trim() },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log('Add member API response:', response.data);
        return response.data;

    } catch (error) {
        console.error('Add member API error:', error);

        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data.message || error.response.data.error || 'Server error');
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from server. Check if backend is running.');
        } else {
            // Something else happened
            throw error;
        }
    }
}

