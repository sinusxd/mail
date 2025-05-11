import {configureStore} from '@reduxjs/toolkit';
import authReducer from "../store/authSlice";
import mailReducer from "../store/mailSlice"
import mailAccountReducer from "../store/mailAccountSlice"


export const store = configureStore({
    reducer: {
        auth: authReducer,
        mail: mailReducer,
        mailAccounts: mailAccountReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;