import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import DOMPurify from "dompurify";
import MailService from "../../../api/services/mailService";
import {EmailInfo} from "../../../api/models/dto/mail";

export default function MailDetail() {
    const [searchParams] = useSearchParams();
    const uid = searchParams.get("uid");
    const accountId = Number(searchParams.get("account_id"));


    const [email, setEmail] = useState<EmailInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("uid", uid);
        console.log("accountId", accountId);

        if (!accountId || !uid) {
            setError("Неверные параметры");
            return;
        }

        setLoading(true);
        MailService.getByUid(accountId, uid)
            .then(setEmail)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [accountId, uid]);


    if (loading) return <p>Загрузка письма...</p>;
    if (error) return <p style={{color: "red"}}>{error}</p>;

    return email ? (
        <div style={{padding: "20px"}}>
            <h2>{email.subject || "(без темы)"}</h2>
            <p>
                <strong>От: </strong>
                {email.sender_name
                    ? `${email.sender_name} (${email.sender_email})`
                    : email.sender_email}
            </p>
            <p><strong>Дата:</strong> {email.date}</p>
            <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(email.body)}}/>
        </div>
    ) : null;
}
