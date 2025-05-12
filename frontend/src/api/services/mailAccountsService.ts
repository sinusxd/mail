import api from "../api";
import { AxiosResponse } from "axios";
import {MailAccount, MailAccountCreate} from "../models/dto/mailAccount";

export default {
  async getAllMailAccounts(): Promise<AxiosResponse<MailAccount[]>> {
    return api.get("/api/v1/mail-accounts");
  },

  async createMailAccount(data: MailAccountCreate): Promise<AxiosResponse<MailAccount>> {
    return api.post("/api/v1/mail-accounts", data);
  },
};
