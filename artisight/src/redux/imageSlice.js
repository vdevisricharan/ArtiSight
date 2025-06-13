// src/redux/imageSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Redux slice for image upload, critique, and suggestions state.
 */
export const imageSlice = createSlice({
    name: 'image',
    initialState: {
        uploadedImage: null,
        critique: null,
        suggestions: null,
    },
    reducers: {
        /**
         * Set the uploaded image (URL or file reference)
         */
        setUploadedImage: (state, action) => {
            state.uploadedImage = action.payload;
        },
        /**
         * Set the critique string
         */
        setCritique: (state, action) => {
            state.critique = action.payload;
        },
        /**
         * Set the suggestions string
         */
        setSuggestions: (state, action) => {
            state.suggestions = action.payload;
        },
        /**
         * Reset all image-related state
         */
        resetImageState: (state) => {
            state.uploadedImage = null;
            state.critique = null;
            state.suggestions = null;
        },
    },
});

export const {
    setUploadedImage,
    setCritique,
    setSuggestions,
    resetImageState,
} = imageSlice.actions;

// Selectors
/** @returns {string|null} uploaded image URL or null */
export const selectUploadedImage = (state) => state.image.uploadedImage;
/** @returns {string|null} critique string or null */
export const selectCritique = (state) => state.image.critique;
/** @returns {string|null} suggestions string or null */
export const selectSuggestions = (state) => state.image.suggestions;

export default imageSlice.reducer;
