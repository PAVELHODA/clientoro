"use client";

import { Button } from "@/components/ui/Button";

type Service = {
  id: string;
  name: string;
  duration_minutes: number | null;
  price: number | null;
  color: string | null;
  category: string | null;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
};

export function ServicesTable({
  services,
  onEdit,
  onDelete,
}: {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Název
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Délka
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Cena
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Barva
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Buffery
            </th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">
              Akce
            </th>
          </tr>
        </thead>

        <tbody>
          {services.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="text-center text-gray-500 py-6 text-sm"
              >
                Žádné služby zatím nejsou vytvořené.
              </td>
            </tr>
          )}

          {services.map((service) => (
            <tr
              key={service.id}
              className="border-b last:border-0 hover:bg-gray-50 transition"
            >
              {/* Název */}
              <td className="px-4 py-3">
                <div className="font-medium">{service.name}</div>
                {service.category && (
                  <div className="text-xs text-gray-500">
                    {service.category}
                  </div>
                )}
              </td>

              {/* Délka */}
              <td className="px-4 py-3 text-gray-700">
                {service.duration_minutes
                  ? `${service.duration_minutes} min`
                  : "—"}
              </td>

              {/* Cena */}
              <td className="px-4 py-3 text-gray-700">
                {service.price !== null
                  ? `${service.price.toFixed(2)} Kč`
                  : "—"}
              </td>

              {/* Barva */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{
                      backgroundColor: service.color || "#3b82f6",
                    }}
                  />
                  <span className="text-xs text-gray-600">
                    {service.color}
                  </span>
                </div>
              </td>

              {/* Buffery */}
              <td className="px-4 py-3">
                <div className="flex gap-2 text-xs">
                  {service.buffer_before_minutes > 0 && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      +{service.buffer_before_minutes} min před
                    </span>
                  )}
                  {service.buffer_after_minutes > 0 && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      +{service.buffer_after_minutes} min po
                    </span>
                  )}
                  {service.buffer_before_minutes === 0 &&
                    service.buffer_after_minutes === 0 && (
                      <span className="text-gray-400">—</span>
                    )}
                </div>
              </td>

              {/* Akce */}
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    className="px-2 py-1"
                    onClick={() => onEdit(service)}
                  >
                    Upravit
                  </Button>
                  <Button
                    variant="danger"
                    className="px-2 py-1"
                    onClick={() => onDelete(service)}
                  >
                    Smazat
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
