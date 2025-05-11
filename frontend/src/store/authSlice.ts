import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { LoginRequest } from "../api/models/request/loginRequest";
import { LoginResponse } from "../api/models/response/loginResponse";
import AuthService from "../api/services/authService";

interface User {
    id: number;
    username: string;
}

interface AuthState {
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    user: User | null;
}

const getLocalToken = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
};

const getLocalUser = (): User | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

const initialState: AuthState = {
    accessToken: getLocalToken("access_token"),
    isAuthenticated: !!getLocalToken("access_token"),
    loading: false,
    error: null,
    user: getLocalUser(),
};

export const loginUser = createAsyncThunk<
    LoginResponse,
    LoginRequest,
    { rejectValue: string }
>(
    "auth/loginUser",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(credentials);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Ошибка авторизации");
        }
    }
);

export const fetchCurrentUser = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
    try {
        const response = await AuthService.getMe();
        return response.data;
    } catch (error: any) {
        return rejectWithValue("Не удалось получить данные пользователя");
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.accessToken = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
                const { access_token } = action.payload;
                state.accessToken = access_token;
                state.isAuthenticated = true;
                state.loading = false;
                localStorage.setItem("access_token", access_token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Неизвестная ошибка";
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                    state.user = action.payload;
                    localStorage.setItem("user", JSON.stringify(action.payload));
                })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.error = action.payload || "Ошибка при загрузке пользователя";
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
