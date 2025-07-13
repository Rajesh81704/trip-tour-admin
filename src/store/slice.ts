"use client";

import { configureStore, createSlice } from "@reduxjs/toolkit";

export interface User {
    id: string;
}

interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isLoggedIn: false,
    } as AuthState,
    reducers: {
        setUser: (state, action: { payload: User | null }) => {
            state.user = action.payload;
            state.isLoggedIn = action.payload !== null;
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
        },
    },
});

export const { setUser, logout } = authSlice.actions;

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;