import { configureStore } from '@reduxjs/toolkit';
import checkinReducer from './checkinslice';

export default configureStore({
    reducer: {
        checkin: checkinReducer,
    },
});