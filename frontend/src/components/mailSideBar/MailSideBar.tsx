import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {FolderInfo} from "../../api/models/dto/folderInfo";
import {
    fetchEmailsByFolder,
    fetchFolders,
    setSelectedFolder,
} from "../../store/mailAccountSlice";
import {AppDispatch, RootState} from "../../store/store";

interface MailSideBarProps {
    onCompose: () => void;
}

export default function MailSideBar({onCompose}: MailSideBarProps) {
    const dispatch = useDispatch<AppDispatch>();
    const folders = useSelector((state: RootState) => state.mailAccounts.folders);
    const selectedFolder = useSelector((state: RootState) => state.mailAccounts.selectedFolder);
    const selectedAccount = useSelector((state: RootState) => state.mailAccounts.selected);

    useEffect(() => {
        if (selectedAccount) {
            dispatch(fetchFolders(selectedAccount.id));
        }
    }, [selectedAccount, dispatch]);

    const handleSelectFolder = (folder: FolderInfo) => {
        dispatch(setSelectedFolder(folder));
        if (selectedAccount) {
            dispatch(fetchEmailsByFolder({
                accountId: selectedAccount.id,
                folderName: folder.name,
                offset: 0,
                limit: 20,
            }));
        }
    };

    return (
        <div style={{width: 200, borderRight: "1px solid #ddd", padding: 16}}>
            <h3 style={{marginBottom: 12}}>Папки</h3>
            {folders.map((folder: FolderInfo) => (
                <div
                    key={folder.id}
                    onClick={() => handleSelectFolder(folder)}
                    style={{
                        padding: "8px 0px",
                        backgroundColor: selectedFolder?.id === folder.id ? "#f0f4f8" : "transparent",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: selectedFolder?.id === folder.id ? 600 : 400,
                        textAlign: "left",
                        paddingLeft: `${(folder.name.match(/\|/g)?.length || 0) * 12}px`,
                    }}
                >
                    📁 {folder.name.split("|").pop()}
                </div>
            ))}

            <button
                style={{
                    marginTop: 24,
                    padding: "8px 12px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    width: "100%",
                }}
                onClick={onCompose}
            >
                ✉️ Написать письмо
            </button>
        </div>
    );
}
