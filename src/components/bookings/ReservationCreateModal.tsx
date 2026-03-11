"use client";

import { useEffect, useState } from "react";

export default function ReservationCreateModal({
  date,
  time,
  employeeId,
  onClose,
  onCreated,
}: {
  date: string;
  time: string;
  employeeId: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    service_id: "",
    note: "",
  });

  useEffect(() => {
    async function loadServices() {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      setServices(data);
      setLoading(false);
    }
    loadServices();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.service_id || !employeeId) return;

    const service = services.find((s) => s.id === form.service_id);
    if (!service) return;

    // Build start datetime
    const start = new Date(`${date}T${time}:00`);

    // Calculate end time
    const end = new Date(start);
    end.setMinutes(
      end.getMinutes() +
        service.duration_minutes +
        service.buffer_before_minutes +
        service.buffer_after_minutes
    );

    const payload = {
      employee_id: employeeId,
      service_id: form.service_id,
      start: start.toISOString(),
      end: end.toISOString(),
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email,
      note: form.note,
    };

    const res = await fetch("/api/admin/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onCreated();
      onClose();
    } else {
      console.error("Reservation create error:", await res.text());
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
          Načítám služby…
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Nová rezervace</h2>

        <div className="mb-3">
          <label className="block text-sm">Datum</label>
          <input className="input" value={date} disabled />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Čas</label>
          <input className="input" value={time} disabled />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Služba</label>
          <select
            name="service_id"
            className="input"
            value={form.service_id}
            onChange={handleChange}
          >
            <option value="">Vyberte službu…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration_minutes} min)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm">Jméno zákazníka</label>
          <input
            name="customer_name"
            className="input"
            value={form.customer_name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Telefon</label>
          <input
            name="customer_phone"
            className="input"
            value={form.customer_phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Email</label>
          <input
            name="customer_email"
            className="input"
            value={form.customer_email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Poznámka</label>
          <textarea
            name="note"
            className="input"
            value={form.note}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-secondary" onClick={onClose}>
            Zavřít
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Vytvořit
          </button>
        </div>
      </div>
    </div>
  );
}
