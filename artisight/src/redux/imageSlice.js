// src/redux/imageSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const imageSlice = createSlice({
    name: 'image',
    initialState: {
        uploadedImage: null,
        critique: null,
    },
    reducers: {
        setUploadedImage: (state, action) => {
            state.uploadedImage = action.payload;
        },
        setCritique: (state, action) => {
            state.critique = action.payload;
        }
    },
});

export const { setUploadedImage, setCritique } = imageSlice.actions;
export default imageSlice.reducer;
