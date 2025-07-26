import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { submitCheckInAPI } from '../services/checkinService'; // Adjust path if needed
import { getCheckInsAPI } from '../services/checkinService';

export const submitCheckIn = createAsyncThunk(
    "checkin/submit",
    async (data) => {
        return await submitCheckInAPI(data);
    }
);

export const fetchCheckIns = createAsyncThunk(
    "checkin/fetchCheckIns",
    async () => {
        return await getCheckInsAPI();
    }
);

const checkinSlice = createSlice({
    name: "checkin",
    initialState: {
        checkins: [],
        loading: false,
        error: null,
    },
    reducers: {
        // Optional: Add a manual refresh action if needed
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Submit CheckIn Cases
            .addCase(submitCheckIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitCheckIn.fulfilled, (state, action) => {
                state.loading = false;
                // Add the new checkin to the beginning of the array (most recent first)
                state.checkins.unshift(action.payload.checkin || action.payload);
            })
            .addCase(submitCheckIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Fetch CheckIns Cases
            .addCase(fetchCheckIns.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCheckIns.fulfilled, (state, action) => {
                state.loading = false;
                // Replace the entire checkins array with fresh data
                state.checkins = action.payload;
            })
            .addCase(fetchCheckIns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { clearError } = checkinSlice.actions;
export default checkinSlice.reducer;