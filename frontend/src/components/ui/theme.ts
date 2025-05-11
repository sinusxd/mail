import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#000',
                    '&.Mui-focused': {
                        color: '#000',
                    },
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: 'black',
                    '&.Mui-checked': {
                        color: 'black',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#fff',
                    backgroundColor: 'black',
                    '&:hover': {
                        backgroundColor: 'black',
                    },
                },
            },
        },
    },
});

export default theme;