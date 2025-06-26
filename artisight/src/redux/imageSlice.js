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
        resources: null, // <-- add this
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
         * Set the resources array
         */
        setResources: (state, action) => {
            state.resources = action.payload;
        },
        /**
         * Reset all image-related state
         */
        resetImageState: (state) => {
            state.uploadedImage = null;
            state.critique = null;
            state.suggestions = null;
            state.resources = null; // <-- reset resources
        },
    },
});

export const {
    setUploadedImage,
    setCritique,
    setSuggestions,
    setResources, // <-- export this
    resetImageState,
} = imageSlice.actions;

// Selectors
/** @returns {string|null} uploaded image URL or null */
export const selectUploadedImage = (state) => state.image.uploadedImage;
/** @returns {string|null} critique string or null */
export const selectCritique = (state) => state.image.critique;
/** @returns {string|null} suggestions string or null */
export const selectSuggestions = (state) => state.image.suggestions;
/** @returns {array|null} resources array or null */
export const selectResources = (state) => state.image.resources;

export default imageSlice.reducer;
