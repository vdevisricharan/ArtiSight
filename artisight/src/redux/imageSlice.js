import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY_ANALYSIS = 'artisight_analysis_result';
const STORAGE_KEY_IMAGE = 'artisight_image_preview';

// Helper to safely rehydrate state from sessionStorage on page refresh
const loadPersistedState = () => {
  try {
    const savedResult = sessionStorage.getItem(STORAGE_KEY_ANALYSIS);
    const savedImage = sessionStorage.getItem(STORAGE_KEY_IMAGE);
    return {
      uploadedImage: savedImage || null,
      analysisResult: savedResult ? JSON.parse(savedResult) : null,
      analysisPhase: savedResult ? 'completed' : 'idle',
      uploadProgress: savedResult ? 100 : 0,
      error: null,
    };
  } catch (e) {
    console.warn('Could not rehydrate state from sessionStorage:', e);
    return {
      uploadedImage: null,
      analysisResult: null,
      analysisPhase: 'idle',
      uploadProgress: 0,
      error: null,
    };
  }
};

export const imageSlice = createSlice({
  name: 'image',
  initialState: loadPersistedState(),
  reducers: {
    setUploadedImage: (state, action) => {
      state.uploadedImage = action.payload;
      try {
        if (action.payload && action.payload.startsWith('data:')) {
          sessionStorage.setItem(STORAGE_KEY_IMAGE, action.payload);
        }
      } catch (e) {
        console.warn('Failed to save image preview to sessionStorage:', e);
      }
    },
    setAnalysisResult: (state, action) => {
      state.analysisResult = action.payload;
      state.analysisPhase = 'completed';
      state.error = null;
      try {
        sessionStorage.setItem(STORAGE_KEY_ANALYSIS, action.payload ? JSON.stringify(action.payload) : '');
      } catch (e) {
        console.warn('Failed to persist analysis to sessionStorage:', e);
      }
    },
    setAnalysisPhase: (state, action) => {
      state.analysisPhase = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.analysisPhase = 'error';
    },
    resetImageState: (state) => {
      state.uploadedImage = null;
      state.analysisResult = null;
      state.analysisPhase = 'idle';
      state.uploadProgress = 0;
      state.error = null;
      try {
        sessionStorage.removeItem(STORAGE_KEY_ANALYSIS);
        sessionStorage.removeItem(STORAGE_KEY_IMAGE);
      } catch (e) {
        console.warn('Failed to clear sessionStorage:', e);
      }
    },
  },
});

export const {
  setUploadedImage,
  setAnalysisResult,
  setAnalysisPhase,
  setUploadProgress,
  setError,
  resetImageState,
} = imageSlice.actions;

// Selectors
export const selectUploadedImage = (state) => state.image.uploadedImage;
export const selectAnalysisResult = (state) => state.image.analysisResult;
export const selectAnalysisPhase = (state) => state.image.analysisPhase;
export const selectUploadProgress = (state) => state.image.uploadProgress;
export const selectError = (state) => state.image.error;

// Backward-compatibility selectors
export const selectCritique = (state) =>
  state.image.analysisResult?.fullCritiqueMarkdown || null;
export const selectSuggestions = (state) =>
  state.image.analysisResult?.recommendations || null;
export const selectResources = (state) =>
  state.image.analysisResult?.resources || null;

export default imageSlice.reducer;
