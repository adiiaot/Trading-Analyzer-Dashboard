interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  className?: string;
}

export function Table({ headers, rows, className }: TableProps) {
  return (
    <div className={`overflow-x-auto -mx-5 md:-mx-0 ${className || ""}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {headers.map((h, idx) => (
              <th key={idx} className="text-left py-3 px-4 md:px-5 first:pl-5 last:pr-5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ridx) => (
            <tr key={ridx} className="border-b border-surface-border/50 transition-colors"
              style={{ borderColor: "var(--glass-border)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--glass-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, cidx) => (
                <td key={cidx} className="py-3 px-4 md:px-5 first:pl-5 last:pr-5 text-text-primary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
