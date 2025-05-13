import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { selectEmail } from "../../../store/mailSlice";
import MailService from "../../../api/services/mailService";

export default function MailDetail() {
    const dispatch = useDispatch();
    const email = useSelector((state: RootState) => state.mail.selectedEmail);
    const selectedAccount = useSelector((state: RootState) => state.mailAccounts.selected);

    const [summary, setSummary] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFullEmail = async () => {
            if (!email?.uid || !selectedAccount?.id) return;

            try {
                setLoading(true);
                const fullEmail = await MailService.getByUid(selectedAccount.id, String(email.uid));
                dispatch(selectEmail(fullEmail));
            } catch (e) {
                setError("Не удалось загрузить содержимое письма.");
            } finally {
                setLoading(false);
            }
        };

        fetchFullEmail();
    }, [email?.uid, selectedAccount?.id, dispatch]);

    const handleSummarize = async () => {
        if (!email?.body) return;
        setSummaryLoading(true);
        setSummary(null);
        try {
            const res = await fetch("/api/v1/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: `Сделай краткое описание письма: ${DOMPurify.sanitize(email.body)}`
                }),
            });

            if (!res.ok) throw new Error("Ошибка при запросе к AI");

            const data = await res.json();
            setSummary(data.reply);
        } catch (e) {
            setSummary("Ошибка при генерации описания.");
        } finally {
            setSummaryLoading(false);
        }
    };

    if (!email) return null;
    if (loading) return <p style={{ padding: 24 }}>📨 Загрузка содержимого письма...</p>;
    if (error) return <p style={{ color: "red", padding: 24 }}>{error}</p>;

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "0 auto",
                backgroundColor: "#fff",
                padding: 24,
                borderRadius: 8,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                fontFamily: "Arial, sans-serif",
                color: "#333",
            }}
        >
            <button
                onClick={() => dispatch(selectEmail(null))}
                style={{
                    marginBottom: 16,
                    background: "#eee",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: "pointer"
                }}
            >
                ← Назад
            </button>

            <h2 style={{ marginBottom: 8 }}>{email.subject || "(без темы)"}</h2>

            <div style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
                <p>
                    <strong>От:</strong>{" "}
                    {email.sender_name
                        ? `${email.sender_name} (${email.sender_email})`
                        : email.sender_email}
                </p>
                <p>
                    <strong>Дата:</strong>{" "}
                    {email.date ? new Date(email.date).toLocaleString() : "—"}
                </p>
            </div>

            <button
                onClick={handleSummarize}
                style={{
                    marginBottom: 16,
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 4,
                    cursor: "pointer",
                }}
            >
                Получить краткое описание
            </button>

            {summaryLoading && <p>✏️ Генерация описания...</p>}
            {summary && (
                <div style={{ marginBottom: 16, background: "#f9f9f9", padding: 12, borderRadius: 4 }}>
                    <strong>Краткое описание:</strong>
                    <p>{summary}</p>
                </div>
            )}

            <hr style={{ marginBottom: 20 }} />
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body || "") }} />
        </div>
    );
}
