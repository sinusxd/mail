import {EmailInfo} from "../models/dto/mail";
import api from "../api";
import {AxiosResponse} from "axios";
import {FolderInfo} from "../models/dto/folderInfo";

export default class MailService {
    static async fetch(
        mailAccountId: number,
        folder_name: string = "INBOX",
        offset: number = 0,
        limit: number = 20
    ): Promise<{ emails: EmailInfo[]; email_count: number }> {
        const response: AxiosResponse<{
            emails: EmailInfo[];
            email_count: number;
        }> = await api.get("/api/v1/mails", {
            params: {
                mail_account_id: mailAccountId,
                folder_name,
                offset,
                limit,
            },
        });
        return response.data;
    }

    static async getByUid(
        mailAccountId: number,
        uid: string
    ): Promise<EmailInfo> {
        const response: AxiosResponse<EmailInfo> = await api.get("/api/v1/mails/by-uid", {
            params: {
                account_id: mailAccountId,
                uid,
            },
        });
        return response.data;
    }

    static async fetchFolders(mailAccountId: number): Promise<FolderInfo[]> {
        const response: AxiosResponse<FolderInfo[]> = await api.get("/api/v1/mails/folders", {
            params: {
                mail_account_id: mailAccountId,
            },
        });
        return response.data;
    }
}
