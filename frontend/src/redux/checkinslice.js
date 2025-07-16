import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { submitCheckInAPI } from '../services/checkinService'; // Adjust path if needed

export const submitCheckIn = createAsyncThunk(
    "checkin/submit",
    async (data) => {
        return await submitCheckInAPI(data);
    }
);

const checkinSlice = createSlice({
    name: "checkin",
    initialState: {
        checkins: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitCheckIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitCheckIn.fulfilled, (state, action) => {
                state.loading = false;
                state.checkins.push(action.payload);
            })
            .addCase(submitCheckIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});
export default checkinSlice.reducer;
