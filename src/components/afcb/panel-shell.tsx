import type { ReactNode, ComponentType } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Globe, Bell, ChevronDown, UserRound, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "./ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleLabel } from "@/lib/use-auth";

import type { AppRole } from "@/lib/roles";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { demoNews } from "@/lib/demo-data";
export type NavItem = { title: string; to: "/painel" | "/admin" | "/clube" | "/jogador" | "/demonstracao"; section?: string; perfil?: AppRole; icon: ComponentType<{ className?: string }> };

function NavigationItem({ item, active }: { item: NavItem; active: boolean }) {
  const { setOpenMobile } = useSidebar();
  return <SidebarMenuItem><SidebarMenuButton asChild isActive={active} tooltip={item.title} className="h-11 border-l-2 border-transparent px-3 text-sm data-[active=true]:border-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary"><Link to={item.to} search={{ section: item.section, perfil: item.perfil }} onClick={() => setOpenMobile(false)}><item.icon className="h-4 w-4" /><span>{item.title}</span></Link></SidebarMenuButton></SidebarMenuItem>;
}

function Notifications({ preview }: { preview: boolean }) {
  const [read, setRead] = useState(false);
  return <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label="Notificações" title="Notificações" className="relative h-10 w-10"><Bell />{preview && !read && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />}</Button></PopoverTrigger><PopoverContent align="end" className="w-[min(360px,calc(100vw-24px))] p-0"><div className="flex items-center justify-between border-b border-border p-4"><h2 className="text-xl font-semibold">Notificações</h2>{preview && <Button variant="ghost" size="icon" aria-label="Marcar exemplos como lidos" title="Marcar como lidos" onClick={() => setRead(true)} disabled={read}><CheckCheck /></Button>}</div>{preview ? <><p className="px-4 pt-3 text-xs text-gold">Comunicados de exemplo · {read ? "Lidos" : "Não lidos"}</p><ul className="divide-y divide-border">{demoNews.map((n) => <li key={n.id}><Link to="/noticias" className="block p-4 hover:bg-muted"><p className="mb-1 text-xs text-muted-foreground">{n.tag}</p><p className="text-sm leading-relaxed">{n.title}</p></Link></li>)}</ul></> : <div className="p-6 text-center"><Bell className="mx-auto mb-3 h-6 w-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhuma notificação oficial disponível.</p></div>}</PopoverContent></Popover>;
}

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
          <SidebarHeader className="h-20 justify-center border-b border-sidebar-border px-4"><Logo /></SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="px-3 py-5">
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((it) => (
                    <NavigationItem key={`${it.to}-${it.section ?? "home"}`} item={it} active={path === it.to && (!it.section || activeSection === it.section)} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton asChild tooltip="Site público"><Link to="/"><Globe className="h-4 w-4" /><span>Site público</span></Link></SidebarMenuButton></SidebarMenuItem>
              {!preview && <SidebarMenuItem><SidebarMenuButton onClick={signOut} tooltip="Sair"><LogOut className="h-4 w-4" /><span>Sair</span></SidebarMenuButton></SidebarMenuItem>}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3"><SidebarTrigger aria-label="Abrir ou recolher menu" title="Menu lateral" className="h-10 w-10 shrink-0" /><div className="min-w-0"><p className="font-display text-lg font-semibold">AFCB <span className="hidden text-muted-foreground sm:inline">/ Gestão esportiva</span></p><p className="truncate text-xs text-muted-foreground">{label}</p></div></div>
            <div className="flex shrink-0 items-center gap-2">
              <Notifications preview={preview} />
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" aria-label="Perfil do usuário" className="h-11 gap-3 px-2"><span className="grid h-8 w-8 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><UserRound className="h-4 w-4" /></span><span className="hidden max-w-48 text-left sm:block"><span className="block truncate text-sm">{preview ? "Prévia AFCB" : user?.email}</span><span className="block truncate text-xs text-muted-foreground">{preview ? "Dados de exemplo" : roles.map((r) => roleLabel[r]).join(" · ") || "Visitante"}</span></span><ChevronDown className="hidden sm:block" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64"><DropdownMenuLabel className="break-words">{preview ? "Prévia AFCB · Dados de exemplo" : user?.email}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/"><Globe />Site público</Link></DropdownMenuItem>{preview ? <DropdownMenuItem asChild><Link to="/auth"><UserRound />Entrar na minha conta</Link></DropdownMenuItem> : <DropdownMenuItem onClick={signOut}><LogOut />Sair</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:p-8"><div className="mx-auto max-w-[1440px]">{children}</div></main>
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
