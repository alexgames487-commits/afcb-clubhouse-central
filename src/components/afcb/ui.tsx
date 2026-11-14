import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, FlaskConical, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoClub } from "@/lib/demo-data";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="AFCB — início" className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="relative grid h-10 w-9 shrink-0 place-items-center text-primary"><Shield className="absolute h-10 w-9" strokeWidth={1.4} /><span className="font-display text-sm font-bold">AF</span></span>
      <span className="min-w-0 leading-none group-data-[collapsible=icon]:hidden">
        <span className="block font-display text-lg font-bold tracking-wide">AFCB</span>
        <span className="mt-1 block text-[9px] uppercase text-muted-foreground">Associação Federativa Clubs Brasil</span>
      </span>
    </Link>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded border border-gold/30 bg-gold/5 px-2 py-1 text-[10px] font-medium uppercase text-gold", className)}>
      <FlaskConical className="h-3 w-3" /> Dados de exemplo
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, demo, actions }: { eyebrow?: string; title: string; description?: string; demo?: boolean; actions?: ReactNode }) {
  return (
    <div className="mb-8 grid min-w-0 gap-4 border-b border-border pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end animate-rise">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{title}</h1>
          {demo && <DemoBadge className="mt-3" />}
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: { label: string; value: string | number; hint?: string; icon?: React.ComponentType<{ className?: string }>; tone?: "primary" | "gold" | "success" }) {
  const toneCls = { primary: "text-primary bg-primary/10", gold: "text-gold bg-gold/10", success: "text-success bg-success/10" }[tone];
  return (
    <div className="surface min-w-0 p-4 sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="min-w-0 text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <span className={cn("grid h-8 w-8 place-items-center rounded-md", toneCls)}><Icon className="h-4 w-4" /></span>}
      </div>
      <p className="mt-3 break-words font-display text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 border-t border-border pt-5", className)}>
      {title && (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="min-w-0 text-xl font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function Crest({ club, size = "md" }: { club: Pick<DemoClub, "short" | "color">; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-7 w-7 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-20 w-20 text-xl" }[size];
  return (
    <span title={club.short} className={cn("club-crest relative grid shrink-0 place-items-center font-display font-bold", s, club.color === "gold" ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary")}>
      <Shield className="absolute h-full w-full opacity-50" strokeWidth={1} /><span className="relative pb-1">{club.short}</span>
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
