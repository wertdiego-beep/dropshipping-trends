"use client";

interface Props {
  periodo: number;
  onChange: (dias: number) => void;
}

const opciones = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "3M", value: 90 },
];

export default function FiltrosPeriodo({ periodo, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-base)" }}>
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
          style={
            periodo === op.value
              ? { background: "var(--accent)", color: "#fff" }
              : { color: "var(--text-muted)" }
          }
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
