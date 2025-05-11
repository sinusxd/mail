import { SetStateAction, useEffect, useState} from "react";
import {MailAccount} from "../../../api/models/dto/mailAccount";
import MailAccountsService from "../../../api/services/mailAccountsService";

interface MailAccountSelectorProps {
    onSelect: (account: MailAccount) => void;
}

export default function MailAccountSelector({onSelect}: MailAccountSelectorProps) {
    const [accounts, setAccounts] = useState<MailAccount[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        MailAccountsService.getAllMailAccounts()
            .then((res: { data: SetStateAction<MailAccount[]>; }) => setAccounts(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3>Выберите аккаунт</h3>
      {loading && <p>Загрузка...</p>}
      <select onChange={(e) => {
        const selected = accounts.find(acc => acc.id === Number(e.target.value));
        if (selected) onSelect(selected);
      }}>
        <option value="">Выберите аккаунт</option>
        {accounts.map(acc => (
          <option key={acc.id} value={acc.id}>
            {acc.mail_email}
          </option>
        ))}
      </select>
    </div>
  );
}
