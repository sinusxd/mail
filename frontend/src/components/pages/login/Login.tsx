import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Paper,
    Link,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {fetchCurrentUser, loginUser} from "../../../store/authSlice";
import { LoginRequest } from "../../../api/models/request/loginRequest";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    const [request, setRequest] = useState<LoginRequest>({ username: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRequest({ ...request, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginUser(request));
    };

    useEffect(() => {
        if (isAuthenticated && !user) {
            dispatch(fetchCurrentUser());
        }
    }, [isAuthenticated, user, dispatch]);

    useEffect(() => {
        console.log(user)
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <Paper elevation={3} sx={{ padding: 6, backgroundColor: '#fff', textAlign: 'center', borderRadius: 2, width: '500px' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Авторизация
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <TextField
                        label="Имя пользователя"
                        name="username"
                        type="text"
                        value={request.username}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Пароль"
                        name="password"
                        type="password"
                        value={request.password}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <Box sx={{ minHeight: 24 }}>
                        {error && <Typography color="error">{error}</Typography>}
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ backgroundColor: '#000', color: '#fff', mt: 2 }}
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? "Вход..." : "Войти"}
                    </Button>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Нет аккаунта?{" "}
                        <Link href="/signup" underline="hover" sx={{ fontWeight: 'bold', color: '#000' }}>
                            Зарегистрироваться
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
