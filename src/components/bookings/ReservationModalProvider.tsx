"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import ReservationEditModal from "./ReservationEditModal";
import ReservationCreateModal from "./ReservationCreateModal";

type ReservationModalContextType = {
  openCreate: (date: Date, employeeId?: string | null) => void;
  openEdit: (reservationId: string) => void;
  close: () => void;
};

const ModalContext = createContext<ReservationModalContextType | null>(null);

export default function ReservationModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [createData, setCreateData] = useState<{
    date: Date;
    employeeId?: string | null;
  } | null>(null);

  const [editId, setEditId] = useState<string | null>(null);

  const openCreate = (date: Date, employeeId?: string | null) => {
    setEditId(null);
    setCreateData({ date, employeeId });
  };

  const openEdit = (reservationId: string) => {
    setCreateData(null);
    setEditId(reservationId);
  };

  const close = () => {
    setCreateData(null);
    setEditId(null);
  };

  return (
    <ModalContext.Provider value={{ openCreate, openEdit, close }}>
      {children}

      {createData && (
        <ReservationCreateModal
          date={createData.date.toISOString().split("T")[0]}
          time={createData.date.toISOString().split("T")[1]?.slice(0, 5) ?? ""}
          onClose={close}
        />
      )}

      {editId && (
        <ReservationEditModal
          reservation={{ id: editId }}
          onClose={close}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useReservationModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useReservationModal must be used inside ReservationModalProvider");
  }
  return ctx;
}
