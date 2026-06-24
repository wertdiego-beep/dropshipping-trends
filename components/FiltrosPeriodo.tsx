"use client";

interface Props {
  periodo: number;
  onChange: (dias: number) => void;
}

const opciones = [
  { label: "7 días", value: 7 },
  { label: "30 días", value: 30 },
  { label: "3 meses", value: 90 },
];

export default function FiltrosPeriodo({ periodo, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            periodo === op.value
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
