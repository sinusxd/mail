import React, {useEffect, useState} from "react";
import {EmailInfo} from "../../api/models/dto/mail";
import MailService from "../../api/services/mailService";
import {
    FaRegStar as FaRegStarRaw,
    FaStar as FaStarRaw,
    FaChevronRight as FaChevronRightRaw,
} from "react-icons/fa";
import {IconBaseProps} from "react-icons";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {selectEmail, setEmails} from "../../store/mailSlice";

const FaRegStar = FaRegStarRaw as unknown as React.FC<IconBaseProps>;
const FaStar = FaStarRaw as unknown as React.FC<IconBaseProps>;
const FaChevronRight = FaChevronRightRaw as unknown as React.FC<IconBaseProps>;

const PAGE_SIZE = 20;

export default function MailList({page}: { page: number }) {
    const dispatch = useDispatch();
    const account = useSelector((state: RootState) => state.mailAccounts.selected);
    const selectedFolder = useSelector((state: RootState) => state.mailAccounts.selectedFolder);
    const [emails, setLocalEmails] = useState<EmailInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!account || !selectedFolder) return;

        setLoading(true);
        setShowSkeleton(false);
        const skeletonTimeout = setTimeout(() => setShowSkeleton(true), 150);

        MailService.fetch(account.id, selectedFolder.name, page * PAGE_SIZE, PAGE_SIZE)
            .then(({emails}) => {
                const sorted = [...emails].sort((a, b) => Number(b.uid) - Number(a.uid));
                setLocalEmails(sorted);
                dispatch(setEmails(sorted));
            })
            .catch((err) => setError(err.message))
            .finally(() => {
                clearTimeout(skeletonTimeout);
                setLoading(false);
                setShowSkeleton(false);
            });
    }, [account, selectedFolder, page, dispatch]);

    const toggleStar = (uid: number) => {
        setLocalEmails((prev) =>
            prev.map((email) =>
                email.uid === uid ? {...email, is_starred: !email.is_starred} : email
            )
        );
    };

    if (!account || !selectedFolder) return null;

    return (
        <div style={{width: "100%"}}>
            <table style={{width: "100%", borderCollapse: "collapse", tableLayout: "fixed"}}>
                <tbody>
                {showSkeleton &&
                    [...Array(20)].map((_, i) => (
                        <tr key={`skeleton-${i}`}
                            style={{backgroundColor: "#f6f6f6", animation: "pulse 1.5s infinite"}}>
                            <td style={{padding: 8, width: "5%"}}>
                                <div style={{width: 16, height: 16, backgroundColor: "#ccc"}}/>
                            </td>
                            <td style={{padding: 8, width: "5%"}}>
                                <div style={{width: 16, height: 16, backgroundColor: "#ccc"}}/>
                            </td>
                            <td style={{padding: 8, width: "5%"}}>
                                <div style={{width: 14, height: 14, backgroundColor: "#ccc"}}/>
                            </td>
                            <td style={{padding: 8, width: "25%"}}>
                                <div style={{height: 12, backgroundColor: "#ccc", width: "80%"}}/>
                            </td>
                            <td style={{padding: 8, width: "50%"}}>
                                <div style={{height: 12, backgroundColor: "#ccc", width: "90%"}}/>
                            </td>
                            <td style={{padding: 8, width: "10%"}}>
                                <div style={{height: 10, backgroundColor: "#ccc", width: 60}}/>
                            </td>
                        </tr>
                    ))}

                {!loading && error && (
                    <tr>
                        <td colSpan={6} style={{color: "red", padding: 16}}>{error}</td>
                    </tr>
                )}

                {!loading &&
                    emails.map((email) => (
                        <tr
                            key={email.uid}
                            onClick={() => dispatch(selectEmail(email))}
                            style={{cursor: "pointer", transition: "background-color 0.2s"}}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fc")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                        >
                            <td style={{padding: 8, width: "5%"}}><input type="checkbox"/></td>
                            <td style={{padding: 8, width: "5%"}} onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(email.uid);
                            }}>
                                {email.is_starred ? <FaStar size={16} color="#fdd835"/> :
                                    <FaRegStar size={16} color="#999"/>}
                            </td>
                            <td style={{padding: 8, width: "5%"}}><FaChevronRight size={14} color="#999"/></td>
                            <td style={{
                                padding: 8,
                                width: "25%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {email.sender_name ? `${email.sender_name} (${email.sender_email})` : email.sender_email}
                            </td>
                            <td style={{
                                padding: 8,
                                width: "50%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                <span style={{fontWeight: 500}}>{email.subject || "(без темы)"}</span>
                                <span style={{color: "#666"}}> – {email.snippet}</span>
                            </td>
                            <td style={{padding: 8, width: "10%", fontSize: 13, color: "#666"}}>
                                {email.date ? new Date(email.date).toLocaleDateString() : ""}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        tr:hover {
          background-color: #f7f9fc;
        }
      `}</style>
        </div>
    );
}
