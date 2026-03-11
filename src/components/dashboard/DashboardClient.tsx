"use client";

import { useEffect, useState } from "react";

type Mode = "SOLO" | "BUSINESS";

type Reservation = {
  id: string;
  date: string;
  time: string;
  duration_minutes: number;
  client_name: string | null;
  service_name: string | null;
  color: string | null;
  employee_id?: string | null;
};

export default function DashboardClient() {
  const [mode, setMode] = useState<Mode>("SOLO");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMode() {
      try {
        const res = await fetch("/api/system/mode");
        const data = await res.json();
        if (data?.mode === "SOLO" || data?.mode === "BUSINESS") {
          setMode(data.mode);
        }
      } catch (e) {
        console.error("Failed to load mode", e);
      }
    }
    loadMode();
  }, []);

  useEffect(() => {
    async function loadReservations() {
      setLoading(true);
      try {
        const endpoint =
          mode === "BUSINESS"
            ? "/api/admin/reservations"
            : "/api/solo/reservations";

        const res = await fetch(endpoint);
        const data = await res.json();
        setReservations(data || []);
      } catch (e) {
        console.error("Failed to load reservations", e);
      }
      setLoading(false);
    }

    loadReservations();
  }, [mode]);

  if (loading) {
    return (
      <div className="p-6 text-gray-500 text-sm">
        Načítám dashboard…
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todaysReservations = reservations.filter((r) => r.date === today);

  const uniqueClients = new Set(
    reservations.map((r) => r.client_name).filter(Boolean)
  ).size;

  const uniqueServices = new Set(
    reservations.map((r) => r.service_name).filter(Boolean)
  ).size;

  const employeesMap: Record<string, number> = {};
  if (mode === "BUSINESS") {
    reservations.forEach((r) => {
      if (!r.employee_id) return;
      employeesMap[r.employee_id] =
        (employeesMap[r.employee_id] || 0) + 1;
    });
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">
        {mode === "BUSINESS" ? "Dashboard firmy" : "Dashboard OSVČ"}
      </h1>

      {/* SOLO + BUSINESS shared cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border rounded-lg shadow-sm">
          <div className="text-gray-500 text-sm">Dnešní rezervace</div>
          <div className="text-3xl font-bold mt-2">
            {todaysReservations.length}
          </div>
        </div>

        <div className="p-5 bg-white border rounded-lg shadow-sm">
          <div className="text-gray-500 text-sm">Počet klientů</div>
          <div className="text-3xl font-bold mt-2">{uniqueClients}</div>
        </div>

        <div className="p-5 bg-white border rounded-lg shadow-sm">
          <div className="text-gray-500 text-sm">Počet služeb</div>
          <div className="text-3xl font-bold mt-2">{uniqueServices}</div>
        </div>
      </div>

      {/* BUSINESS ONLY widgets */}
      {mode === "BUSINESS" && (
        <>
          <h2 className="text-xl font-semibold mt-10">
            Přehled zaměstnanců
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(employeesMap).length === 0 && (
              <div className="text-gray-500 text-sm">
                Žádné rezervace přiřazené zaměstnancům.
              </div>
            )}

            {Object.entries(employeesMap).map(([employeeId, count]) => (
              <div
                key={employeeId}
                className="p-5 bg-white border rounded-lg shadow-sm"
              >
                <div className="text-gray-500 text-sm">
                  Zaměstnanec ID:
                </div>
                <div className="text-lg font-semibold mt-1">
                  {employeeId}
                </div>

                <div className="mt-3 text-gray-500 text-sm">
                  Počet rezervací:
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
          </div>

          {/* Placeholder for future charts */}
          <h2 className="text-xl font-semibold mt-10">
            Statistiky (brzy doplníme)
          </h2>

          <div className="p-6 bg-gray-50 border rounded-lg text-gray-500 text-sm">
            Grafy vytíženosti, tržby, trendy…  
            Připravíme po dokončení hlavních modulů.
          </div>
        </>
      )}
    </div>
  );
}
