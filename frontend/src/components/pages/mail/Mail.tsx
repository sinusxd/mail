import React, { useState } from "react";
import MailSideBar from "../../mailSideBar/MailSideBar";
import MailHeader from "../../mailHeader/MailHeader";
import MailList from "../../mailList/MailLsit";
import MailComposer from "../mailComposer/MailComposer";

export default function Mail() {
    const [page, setPage] = useState(0);
    const [isComposing, setIsComposing] = useState(false);

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <MailSideBar onCompose={() => setIsComposing(true)} />
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                {!isComposing && <MailHeader page={page} setPage={setPage} />}
                {isComposing ? (
                    <MailComposer />
                ) : (
                    <MailList page={page} />
                )}
            </div>
        </div>
    );
}
