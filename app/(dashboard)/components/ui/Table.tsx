interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  className?: string;
}

export function Table({ headers, rows, className }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className || ""}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bg-tertiary">
            {headers.map((header, idx) => (
              <th key={idx} className="text-left py-3 px-4 font-semibold text-text-secondary">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ridx) => (
            <tr key={ridx} className="border-b border-bg-tertiary hover:bg-bg-tertiary">
              {row.map((cell, cidx) => (
                <td key={cidx} className="py-3 px-4 text-text-primary">
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
