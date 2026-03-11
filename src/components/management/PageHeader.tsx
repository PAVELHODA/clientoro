// PATH: src/components/admin/PageHeader.tsx
// Moderní, čistý a sjednocený header pro celý admin.
// Kompatibilní s budoucím theme systémem a layoutem.

"use client";

export default function PageHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: string; // např. "⚙️", "📅", "🛠️"
}) {
  return (
    <div
      style={{
        marginBottom: 32,
        paddingBottom: 16,
        borderBottom: "1px solid #eee",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && (
          <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
        )}

        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            margin: 0,
            padding: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {description && (
        <p
          style={{
            fontSize: 16,
            color: "#555",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
