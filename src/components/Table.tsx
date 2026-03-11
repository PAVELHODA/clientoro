export default function Table({ columns, data }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0 8px",
        fontSize: 15,
      }}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col}
              style={{
                textAlign: "left",
                padding: "12px 16px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr
            key={i}
            style={{
              background: "white",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {Object.values(row).map((cell, j) => (
              <td
                key={j}
                style={{
                  padding: "14px 16px",
                  borderTopLeftRadius: j === 0 ? 12 : 0,
                  borderBottomLeftRadius: j === 0 ? 12 : 0,
                  borderTopRightRadius: j === Object.values(row).length - 1 ? 12 : 0,
                  borderBottomRightRadius:
                    j === Object.values(row).length - 1 ? 12 : 0,
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
