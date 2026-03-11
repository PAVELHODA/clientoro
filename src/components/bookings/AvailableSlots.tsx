"use client";

import { useEffect, useState } from "react";
import { SlotButton } from "@/components/ui/SlotButton";
import { Card } from "@/components/ui/Card";

type Slot = {
  time: string;
  available: boolean;
};

export default function AvailableSlots({
  employeeId,
  serviceId,
  date,
  onSelect,
}: {
  employeeId: string;
  serviceId: string;
  date: string;
  onSelect: (time: string) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSlots() {
      if (!employeeId || !serviceId || !date) return;

      setLoading(true);

      const res = await fetch(
        `/api/reservations/slots?employeeId=${employeeId}&serviceId=${serviceId}&date=${date}`,
        { cache: "no-store" }
      );

      const data = await res.json();
      setSlots(data.slots || []);
      setLoading(false);
    }

    loadSlots();
  }, [employeeId, serviceId, date]);

  if (!date) return <p>Vyberte datum.</p>;
  if (loading) return <p>Načítám dostupné časy…</p>;

  if (slots.length === 0) {
    return <p>Žádné volné termíny pro tento den.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--spacing-sm)",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
      }}
    >
      {slots.map((slot) => (
        <SlotButton
          key={slot.time}
          time={slot.time}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
        />
      ))}
    </div>
  );
}
