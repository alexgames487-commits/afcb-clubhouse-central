import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "./ui";
import { useAuth } from "@/lib/use-auth";

export const publicNav = [
  { to: "/sobre", label: "Sobre" },
  { to: "/competicoes", label: "Competições" },
  { to: "/clubes", label: "Clubes" },
  { to: "/jogadores", label: "Jogadores" },
  { to: "/mercado", label: "Mercado" },
  { to: "/noticias", label: "Notícias" },
  { to: "/rankings", label: "Rankings" },
  { to: "/calendario", label: "Calendário" },
  { to: "/regulamentos", label: "Regulamentos" },
] as const;

function AccountButton() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-9 w-24" />;
  return user ? (
    <Button asChild size="sm"><Link to="/painel"><LayoutDashboard className="h-4 w-4" />Meu painel</Link></Button>
  ) : (
    <Button asChild size="sm"><Link to="/auth">Entrar</Link></Button>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 xl:flex">
            {publicNav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-primary" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <AccountButton />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden" aria-label="Abrir menu"><Menu /></Button></SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="mt-8 flex flex-col gap-1">
                  {publicNav.map((n) => (
                    <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted" activeProps={{ className: "text-primary" }}>{n.label}</Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-border bg-sidebar">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">Associação Federativa Clubs Brasil — administração de competições de EA SPORTS FC 26 Pro Clubs, exclusivamente Old Gen.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Federação</p>
            {publicNav.slice(0, 5).map((n) => <Link key={n.to} to={n.to} className="block py-1 text-sm hover:text-primary">{n.label}</Link>)}
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informações</p>
            {publicNav.slice(5).map((n) => <Link key={n.to} to={n.to} className="block py-1 text-sm hover:text-primary">{n.label}</Link>)}
          </div>
        </div>
        <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">AFCB não possui vínculo oficial com a Electronic Arts. Dados exibidos com o selo "exemplo" são demonstrativos.</p>
      </footer>
    </div>
  );
}

export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-12">{children}</div>;
}
