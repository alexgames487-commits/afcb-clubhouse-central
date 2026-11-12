import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoClub } from "@/lib/demo-data";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-md bg-brand font-display text-sm font-bold text-primary-foreground shadow-glow">AF</span>
      <span className="leading-none">
        <span className="block font-display text-lg font-bold tracking-wide">AFCB</span>
        <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Federativa Clubs Brasil</span>
      </span>
    </Link>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold", className)}>
      <FlaskConical className="h-3 w-3" /> Dados de exemplo
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, demo, actions }: { eyebrow?: string; title: string; description?: string; demo?: boolean; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-rise">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          {demo && <DemoBadge />}
        </div>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: { label: string; value: string | number; hint?: string; icon?: React.ComponentType<{ className?: string }>; tone?: "primary" | "gold" | "success" }) {
  const toneCls = { primary: "text-primary bg-primary/10", gold: "text-gold bg-gold/10", success: "text-success bg-success/10" }[tone];
  return (
    <div className="surface p-5 transition hover:shadow-glow">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && <span className={cn("grid h-8 w-8 place-items-center rounded-md", toneCls)}><Icon className="h-4 w-4" /></span>}
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("surface p-5", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Crest({ club, size = "md" }: { club: Pick<DemoClub, "short" | "color">; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-7 w-7 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-20 w-20 text-xl" }[size];
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full border-2 font-display font-bold", s, club.color === "gold" ? "border-gold/60 bg-gold/10 text-gold" : "border-primary/60 bg-primary/10 text-primary")}>
      {club.short}
    </span>
  );
}

export function Trend({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", up ? "text-success" : "text-destructive")}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const cls = status === "Em andamento" ? "bg-success/15 text-success" : status === "Inscrições" ? "bg-primary/15 text-primary" : status === "Encerrada" ? "bg-muted text-muted-foreground" : "bg-gold/15 text-gold";
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", cls)}>{status}</span>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
