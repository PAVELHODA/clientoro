"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function ServiceDeleteModal({
  service,
  onClose,
  onDeleted,
}: {
  service: { id: string; name: string };
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setLoading(true);
    setError(null);

    try:
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Nepodařilo se smazat službu.");
        setLoading(false);
        return;
      }

      onDeleted();
      onClose();
    } catch (e) {
      setError("Došlo k chybě při mazání služby.");
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Smazat službu"
      onClose={onClose}
      widthClassName="w-[480px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Zrušit
          </Button>
          <Button variant="danger" onClick={remove} disabled={loading}>
            {loading ? "Mažu…" : "Smazat"}
          </Button>
        </>
      }
    >
      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-700">
        Opravdu chceš smazat službu <strong>{service.name}</strong>?  
        Tato akce je nevratná.
      </p>
    </Modal>
  );
}
