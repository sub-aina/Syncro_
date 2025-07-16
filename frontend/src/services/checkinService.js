import API from "../api";


export const submitCheckInAPI = async (data) => {
    const token = localStorage.getItem("token");
    const res = await API.post("/checkins", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};
