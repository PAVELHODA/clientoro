"use client";

export default function ReservationEditModal({
  reservation,
  onClose,
}: {
  reservation: { id: string };
  onClose: () => void;
}) {
  const handleDelete = () => {
    console.log("Deleting reservation:", reservation.id);
    onClose();
  };

  const handleSave = () => {
    console.log("Saving reservation:", reservation.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Upravit rezervaci</h2>

        <p className="text-sm text-gray-600 mb-4">
          ID rezervace: {reservation.id}
        </p>

        <div className="flex justify-between mt-6">
          <button className="btn-secondary" onClick={onClose}>
            Zavřít
          </button>

          <div className="flex gap-2">
            <button className="btn-danger" onClick={handleDelete}>
              Smazat
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Uložit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
