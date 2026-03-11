// PATH: src/app/(public)/rezervace/page.tsx
"use client";
import React, { useState } from "react";
import { BellRing, Clock, CheckCircle } from "lucide-react";

export default function PublicBookingPage() {
  // V reálném napojení se toto vytáhne ze Supabase dle ID uživatele
  const [availableServices] = useState([
    { name: "Klasická masáž", price: "800", duration: "60" },
    { name: "Sportovní masáž", price: "1000", duration: "60" },
    { name: "Reflexní terapie", price: "500", duration: "30" }
  ]);

  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<any>(null);

  return (
    <div style={{ maxWidth: "450px", width: "100%", background: "#fff", padding: "40px", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "20px", textAlign: "center" }}>INSPIRE ® BOOKING</h1>
      
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b" }}>VYBERTE SI SLUŽBU:</div>
          {availableServices.map((s, i) => (
            <div key={i} onClick={() => { setSelection(s); setStep(2); }} style={{ 
              padding: "20px", borderRadius: "16px", border: "1.5px solid #e2e8f0", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }} onMouseEnter={e => e.currentTarget.style.borderColor = "#10b981"}>
              <div>
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}><Clock size={12} style={{ display: "inline" }} /> {s.duration} min</div>
              </div>
              <div style={{ fontWeight: 800, color: "#10b981" }}>{s.price} Kč</div>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ padding: "15px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
             <div style={{ fontSize: "11px", color: "#64748b" }}>VYBRÁNO:</div>
             <div style={{ fontWeight: 800 }}>{selection?.name} ({selection?.price} Kč)</div>
             <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#6366f1", fontSize: "12px", padding: 0, cursor: "pointer" }}>Změnit službu</button>
          </div>
          
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b" }}>VAŠE ÚDAJE:</div>
          <input placeholder="Jméno a příjmení" style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
          <input placeholder="Telefonní číslo" style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
          
          <button style={{ padding: "16px", background: "#1e293b", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>
            DOKONČIT REZERVACI
          </button>
        </div>
      )}
    </div>
  );
}
