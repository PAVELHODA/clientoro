"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type Employee = {
  id: string;
  name: string;
};

export default function ServiceCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    duration_minutes: 60,
    price: "",
    color: "#3b82f6",
    category: "",
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    employee_ids: [] as string[],
  });

  const update = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Load employees for BUSINESS mode
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/employees");
        const data = await res.json();
        if (!cancelled) setEmployees(data || []);
      } catch (e) {
        if (!cancelled) setError("Nepodařilo se načíst zaměstnance.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleEmployee = (id: string) => {
    update(
      "employee_ids",
      form.employee_ids.includes(id)
        ? form.employee_ids.filter((x) => x !== id)
        : [...form.employee_ids, id]
    );
  };

  const create = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          duration_minutes: form.duration_minutes,
          price: form.price ? Number(form.price) : null,
          color: form.color,
          category: form.category || null,
          buffer_before_minutes: form.buffer_before_minutes,
          buffer_after_minutes: form.buffer_after_minutes,
        }),
      });

      if (!res.ok) {
        setError("Nepodařilo se vytvořit službu.");
        setSaving(false);
        return;
      }

      const service = await res.json();

      // Assign employees (BUSINESS)
      for (const empId of form.employee_ids) {
        await fetch(`/api/admin/services/${service.id}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id: empId }),
        });
      }

      onCreated();
      onClose();
    } catch (e) {
      setError("Došlo k chybě při vytváření služby.");
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Nová služba"
      onClose={onClose}
      widthClassName="w-[640px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={create} disabled={saving}>
            {saving ? "Ukládám…" : "Vytvořit službu"}
          </Button>
        </>
      }
    >
      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Levý sloupec */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Název služby</label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Délka (minuty)</label>
            <Input
              type="number"
              min={5}
              step={5}
              value={form.duration_minutes}
              onChange={(e) =>
                update("duration_minutes", Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cena (Kč)</label>
            <Input
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Kategorie</label>
            <Input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </div>
        </div>

        {/* Pravý sloupec */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Barva služby</label>
            <Input
              type="color"
              value={form.color}
              onChange={(e) => update("color", e.target.value)}
              className="h-10 p-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Buffer před (min)</label>
            <Input
              type="number"
              min={0}
              step={5}
              value={form.buffer_before_minutes}
              onChange={(e) =>
                update("buffer_before_minutes", Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Buffer po (min)</label>
            <Input
              type="number"
              min={0}
              step={5}
              value={form.buffer_after_minutes}
              onChange={(e) =>
                update("buffer_after_minutes", Number(e.target.value))
              }
            />
          </div>

          {/* Zaměstnanci (BUSINESS) */}
          <div>
            <label className="text-sm font-medium">Zaměstnanci</label>

            {loading ? (
              <div className="text-sm text-gray-500">Načítám…</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-auto border rounded p-2">
                {employees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.employee_ids.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                    />
                    {emp.name}
                  </label>
                ))}

                {employees.length === 0 && (
                  <div className="text-xs text-gray-500">
                    Žádní zaměstnanci nejsou vytvořeni.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Popis</label>
        <Textarea
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />
      </div>
    </Modal>
  );
}
