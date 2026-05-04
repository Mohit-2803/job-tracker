"use client";

type Counts = {
  pending: number;
  accepted: number;
  rejected: number;
};

export function DecisionCounters({
  counts,
  total,
}: {
  counts: Counts;
  total: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <CounterTile label="Pending" value={counts.pending} total={total} tone="zinc" />
      <CounterTile label="Accepted" value={counts.accepted} total={total} tone="emerald" />
      <CounterTile label="Rejected" value={counts.rejected} total={total} tone="red" />
    </div>
  );
}

function CounterTile({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "zinc" | "emerald" | "red";
}) {
  const toneCls = {
    zinc: "text-zinc-300 border-zinc-800",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    red: "text-red-400 border-red-500/20 bg-red-500/5",
  }[tone];

  return (
    <div className={`bg-zinc-900/60 border rounded-xl p-4 ${toneCls}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-black">
        {value}
        <span className="text-sm font-bold text-zinc-600">/{total}</span>
      </p>
    </div>
  );
}
