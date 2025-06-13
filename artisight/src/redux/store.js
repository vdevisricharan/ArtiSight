// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import imageReducer from './imageSlice';

/**
 * Redux store configuration
 * Add middleware and devTools toggle for production readiness
 */
export const store = configureStore({
    reducer: {
        image: imageReducer,
    },
    // Add custom middleware here if needed
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    devTools: import.meta.env.MODE !== 'production',
});

// Types for useSelector/useDispatch (for TypeScript projects)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
