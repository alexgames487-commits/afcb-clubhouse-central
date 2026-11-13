import type { ReactNode, ComponentType } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Globe } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "./ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleLabel } from "@/lib/use-auth";

import type { AppRole } from "@/lib/roles";
export type NavItem = { title: string; to: "/painel" | "/admin" | "/clube" | "/jogador" | "/demonstracao"; section?: string; perfil?: AppRole; icon: ComponentType<{ className?: string }> };

export function PanelShell({ label, items, children, preview = false, activeSection }: { label: string; items: NavItem[]; children: ReactNode; preview?: boolean; activeSection?: string }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-3"><Logo /></SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((it) => (
                    <SidebarMenuItem key={it.to}>
                      <SidebarMenuButton asChild isActive={path === it.to && (!it.section || activeSection === it.section)} tooltip={it.title}>
                        <Link to={it.to} search={{ section: it.section, perfil: it.perfil }}>
                          <it.icon className="h-4 w-4" /><span>{it.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton asChild tooltip="Site público"><Link to="/"><Globe className="h-4 w-4" /><span>Site público</span></Link></SidebarMenuButton></SidebarMenuItem>
              {!preview && <SidebarMenuItem><SidebarMenuButton onClick={signOut} tooltip="Sair"><LogOut className="h-4 w-4" /><span>Sair</span></SidebarMenuButton></SidebarMenuItem>}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{preview ? "Prévia AFCB" : user?.email}</p>
                <p className="text-xs text-muted-foreground">{preview ? "Dados de exemplo" : roles.map((r) => roleLabel[r]).join(" · ") || "Visitante"}</p>
              </div>
              {preview ? <Button asChild variant="outline" size="sm"><Link to="/auth">Entrar</Link></Button> : <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>}
            </div>
          </header>
          <main className="grid-lines flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function RestrictedNotice({ role }: { role: string }) {
  return (
    <div className="mx-auto mt-16 max-w-md surface p-8 text-center">
      <h1 className="text-2xl font-bold">Acesso restrito</h1>
      <p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva para o perfil <strong>{role}</strong>. Solicite a atribuição de função ao Superadministrador.</p>
      <Button asChild className="mt-6"><Link to="/painel">Ir para meu painel</Link></Button>
    </div>
  );
}
