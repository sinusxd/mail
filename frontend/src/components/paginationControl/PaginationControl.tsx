import React from "react";
import {
  FaChevronLeft as FaChevronLeftRaw,
  FaChevronRight as FaChevronRightRaw,
} from "react-icons/fa";
import { IconBaseProps } from "react-icons";

const FaChevronLeft = FaChevronLeftRaw as unknown as React.FC<IconBaseProps>;
const FaChevronRight = FaChevronRightRaw as unknown as React.FC<IconBaseProps>;

interface Props {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export default function PaginationControl({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: Props) {
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalCount);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 14, color: "#444" }}>
        {from}–{to} из {totalCount}
      </span>

      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        style={{
          background: "none",
          border: "none",
          cursor: page === 0 ? "default" : "pointer",
          opacity: page === 0 ? 0.3 : 1,
          padding: 4,
          transition: "opacity 0.2s",
        }}
        title="Назад"
      >
        <FaChevronLeft size={16} />
      </button>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        style={{
          background: "none",
          border: "none",
          cursor: page >= totalPages - 1 ? "default" : "pointer",
          opacity: page >= totalPages - 1 ? 0.3 : 1,
          padding: 4,
          transition: "opacity 0.2s",
        }}
        title="Вперёд"
      >
        <FaChevronRight size={16} />
      </button>
    </div>
  );
}
