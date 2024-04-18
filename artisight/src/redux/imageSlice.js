// src/redux/imageSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const imageSlice = createSlice({
    name: 'image',
    initialState: {
        uploadedImage: null,
        critique: null,
        suggestions: null,
    },
    reducers: {
        setUploadedImage: (state, action) => {
            state.uploadedImage = action.payload;
        },
        setCritique: (state, action) => {
            state.critique = action.payload;
        },
        setSuggestions: (state, action) => {
            state.suggestions = action.payload;
        }
    },
});

export const { setUploadedImage, setCritique, setSuggestions} = imageSlice.actions;
export default imageSlice.reducer;
