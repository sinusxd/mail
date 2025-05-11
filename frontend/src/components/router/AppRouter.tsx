import React, {JSX} from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import Login from "../pages/login/Login";
import Signup from "../pages/signup/Signup";
import MailViewer from "../pages/mailViewer/MailViewer";
import MailDetail from "../pages/mailDetail/MailDetail";
import Mail from "../pages/mail/Mail";


interface PrivateRouteProps {
    children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({children}) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    return children;
};


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<MailViewer/>}/>
            <Route path="/mails" element={<Mail/>}/>
            <Route path="/emails" element={<MailDetail/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="*" element={<Navigate to={"/login"}/>}/>
        </Routes>
    );
};

export default AppRouter;
