import {MailAccount} from "../models/dto/mailAccount";
import api from "../api";
import {AxiosResponse} from "axios";

export default class MailAccountsService {

    static async getAllMailAccounts(): Promise<AxiosResponse<MailAccount[]>> {
        return api.get<MailAccount[]>('/api/v1/mail-accounts');
    }
}
