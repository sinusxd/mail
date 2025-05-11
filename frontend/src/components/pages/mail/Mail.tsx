import React from "react";
import MailSideBar from "../../mailSideBar/MailSideBar";
import MailList from "../../mailList/MailLsit";

export default function Mail() {
    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <MailSideBar/>
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 16,
                }}
            >
                <MailList/>
            </div>
        </div>
    );
}
