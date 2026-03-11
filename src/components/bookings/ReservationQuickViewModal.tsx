"use client";

export default function ReservationQuickViewModal({
  reservation,
  onClose,
}) {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[420px] animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Detail rezervace</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="bg-gray-50 border rounded p-3 text-sm mb-6 space-y-2">
          <div>
            <span className="font-medium">Služba:</span>{" "}
            {reservation.service_name || "—"}
          </div>
          <div>
            <span className="font-medium">Klient:</span>{" "}
            {reservation.client_name || "—"}
          </div>
          <div>
            <span className="font-medium">Čas:</span>{" "}
            {reservation.time}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
