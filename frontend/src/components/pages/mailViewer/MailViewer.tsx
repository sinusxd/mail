import {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {RootState, AppDispatch} from "../../../store/store";
import {fetchMailAccounts, setCurrentMailAccount} from "../../../store/mailAccountSlice";
import {useNavigate} from "react-router-dom";

export default function MailViewer() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const accounts = useSelector((state: RootState) => state.mailAccounts.accounts);
    useEffect(() => {
        dispatch(fetchMailAccounts());
    }, [dispatch]);

    const handleSelectAccount = (id: number) => {
        dispatch(setCurrentMailAccount(id));
        navigate("/mails")
    };

    return (
        <div style={{padding: 16}}>
            <h2>Выберите почтовый аккаунт</h2>
            <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                {accounts.map((account) => (
                    <button
                        key={account.id}
                        onClick={() => handleSelectAccount(account.id)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#eee",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer"
                        }}
                    >
                        {account.mail_email}
                    </button>
                ))}
            </div>
        </div>
    );
}
