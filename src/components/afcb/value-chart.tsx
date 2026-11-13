import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { valueHistory } from "@/lib/demo-data";

export function ValueChart() {
  const id = useId().replace(/:/g, "");
  return <div className="h-56 min-w-0"><ResponsiveContainer width="100%" height="100%"><AreaChart data={valueHistory}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
    <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} /><Area type="monotone" dataKey="v" name="AFCB Coins" stroke="var(--primary)" fill={`url(#${id})`} strokeWidth={2} />
  </AreaChart></ResponsiveContainer></div>;
}