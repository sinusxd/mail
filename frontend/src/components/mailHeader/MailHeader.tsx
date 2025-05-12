import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import PaginationControl from "../paginationControl/PaginationControl";
import { setCurrentMailAccount } from "../../store/mailAccountSlice";

interface MailHeaderProps {
  page: number;
  setPage: (p: number) => void;
  onSearchChange?: (search: string) => void;
}

export default function MailHeader({ page, setPage, onSearchChange }: MailHeaderProps) {
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.mailAccounts.accounts);
  const account = useSelector((state: RootState) => state.mailAccounts.selected);
  const selectedFolder = useSelector((state: RootState) => state.mailAccounts.selectedFolder);
  const totalCount = selectedFolder?.email_count || 0;

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (!isNaN(selectedId)) {
      dispatch(setCurrentMailAccount(selectedId));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Левая часть: поиск */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="text"
          placeholder="Поиск по письмам"
          onChange={(e) => onSearchChange?.(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            outline: "none",
            width: 280,
          }}
        />
      </div>

      {/* Правая часть: пагинация и выбор аккаунта */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PaginationControl
          page={page}
          pageSize={20}
          totalCount={totalCount}
          onPageChange={setPage}
        />

        <select
          value={account?.id || ""}
          onChange={handleAccountChange}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            outline: "none",
            fontSize: 14,
          }}
        >
          <option value="" disabled>Выберите аккаунт</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.mail_email}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
