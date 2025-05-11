import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SignupRequest } from '../../../api/models/request/signupRequest';
import AuthService from "../../../api/services/authService";

const Signup: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<SignupRequest>({
        username: '',
        password: '',
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'confirmPassword') {
            setConfirmPassword(value);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        try {
            setLoading(true);
            await AuthService.signup(formData)
            navigate("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <Paper elevation={3} sx={{ padding: 6, backgroundColor: '#fff', textAlign: 'center', borderRadius: 2, width: '500px' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">Регистрация</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <TextField label="Имя" name="username" value={formData.username} onChange={handleChange} fullWidth required />
                    <TextField label="Пароль" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
                    <TextField label="Подтвердите пароль" name="confirmPassword" type="password" value={confirmPassword} onChange={handleChange} fullWidth required />
                    <Box sx={{ minHeight: 24 }}>
                        {error && <Typography color="error">{error}</Typography>}
                    </Box>
                    <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#000', color: '#fff', mt: 2 }} fullWidth>
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Уже есть аккаунт?{" "}
                        <Link href="/login" underline="hover" sx={{ fontWeight: 'bold', color: '#000' }}>
                            Войти
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Signup;