import React, {useState} from "react";
import MailSideBar from "../../mailSideBar/MailSideBar";
import MailHeader from "../../mailHeader/MailHeader";
import MailComposer from "../mailComposer/MailComposer";
import MailDetail from "../mailDetail/MailDetail";
import {useSelector} from "react-redux";
import {RootState} from "../../../store/store";
import MailList from "../../mailList/MailLsit";

export default function Mail() {
    const [page, setPage] = useState(0);
    const [isComposing, setIsComposing] = useState(false);
    const selectedEmail = useSelector((state: RootState) => state.mail.selectedEmail);

    return (
        <div style={{display: "flex", height: "100vh", overflow: "hidden"}}>
            <MailSideBar onCompose={() => setIsComposing(true)}/>
            <div style={{flex: 1, overflowY: "auto", padding: 16}}>
                {!isComposing && !selectedEmail && <MailHeader page={page} setPage={setPage}/>}
                {isComposing ? (
                    <MailComposer/>
                ) : selectedEmail ? (
                    <MailDetail/>
                ) : (
                    <MailList page={page}/>
                )}
            </div>
        </div>
    );
}
