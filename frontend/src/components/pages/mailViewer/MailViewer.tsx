import {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {RootState, AppDispatch} from "../../../store/store";
import {
    fetchMailAccounts,
    setCurrentMailAccount,
    addMailAccount
} from "../../../store/mailAccountSlice";
import {useNavigate} from "react-router-dom";
import MailAccountsService from "../../../api/services/mailAccountsService";
import {MailAccountCreate} from "../../../api/models/dto/mailAccount";

export default function MailViewer() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const accounts = useSelector((state: RootState) => state.mailAccounts.accounts);

    const [form, setForm] = useState<MailAccountCreate>({
        mail_email: "",
        password: "",
        imap_server: "",
        smtp_server: "",
    });

    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchMailAccounts());
    }, [dispatch]);

    const handleSelectAccount = (id: number) => {
        dispatch(setCurrentMailAccount(id));
        navigate("/mails");
    };

    const handleAddAccount = async () => {
        setError(null);
        try {
            const response = await MailAccountsService.createMailAccount(form);
            dispatch(addMailAccount(response.data));
            setForm({mail_email: "", password: "", imap_server: "", smtp_server: ""});
            setAdding(false);
        } catch (e: any) {
            setError(e?.response?.data?.detail || e.message || "Ошибка при добавлении");
        }
    };

    return (
        <div style={{padding: 32, maxWidth: 600, margin: "0 auto"}}>
            <h2 style={{marginBottom: 16}}>Выберите почтовый аккаунт</h2>

            <div style={{display: "flex", flexDirection: "column", gap: 12, marginBottom: 24}}>
                {accounts.map((account) => (
                    <button
                        key={account.id}
                        onClick={() => handleSelectAccount(account.id)}
                        style={{
                            padding: "10px 16px",
                            backgroundColor: "#f0f0f0",
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            fontSize: 16,
                            textAlign: "left",
                            cursor: "pointer",
                        }}
                    >
                        ✉ {account.mail_email}
                    </button>
                ))}
            </div>

            <div style={{borderTop: "1px solid #ccc", paddingTop: 16}}>
                {!adding ? (
                    <button
                        onClick={() => setAdding(true)}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                    >
                        ➕ Добавить аккаунт
                    </button>
                ) : (
                    <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.mail_email}
                            onChange={(e) => setForm({...form, mail_email: e.target.value})}
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Пароль (или app-password)"
                            value={form.password}
                            onChange={(e) => setForm({...form, password: e.target.value})}
                            style={inputStyle}
                        />
                        <input
                            placeholder="IMAP сервер (например, imap.gmail.com)"
                            value={form.imap_server}
                            onChange={(e) => setForm({...form, imap_server: e.target.value})}
                            style={inputStyle}
                        />
                        <input
                            placeholder="SMTP сервер (например, smtp.gmail.com)"
                            value={form.smtp_server}
                            onChange={(e) => setForm({...form, smtp_server: e.target.value})}
                            style={inputStyle}
                        />
                        <div style={{display: "flex", gap: 8}}>
                            <button
                                onClick={handleAddAccount}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                }}
                            >
                                ✅ Сохранить
                            </button>
                            <button
                                onClick={() => setAdding(false)}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                }}
                            >
                                ❌ Отмена
                            </button>
                        </div>
                        {error && <p style={{color: "red"}}>{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
};
