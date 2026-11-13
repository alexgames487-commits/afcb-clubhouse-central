import { LayoutDashboard, Shield, Users, Trophy, ShoppingCart, ArrowLeftRight, Coins, ChartNoAxesCombined, Newspaper, ScrollText, Settings, UserCog, CalendarDays, ListChecks, Contact } from "lucide-react";
import type { AppRole } from "./roles";

export const panelSections = {
  superadmin: [
    { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
    { id: "clubes", title: "Clubes", icon: Shield },
    { id: "jogadores", title: "Jogadores", icon: Users },
    { id: "competicoes", title: "Competições", icon: Trophy },
    { id: "mercado", title: "Mercado BID", icon: ShoppingCart },
    { id: "transferencias", title: "Transferências", icon: ArrowLeftRight },
    { id: "financas", title: "Finanças", icon: Coins },
    { id: "estatisticas", title: "Estatísticas", icon: ChartNoAxesCombined },
    { id: "noticias", title: "Notícias", icon: Newspaper },
    { id: "regulamentos", title: "Regulamentos", icon: ScrollText },
    { id: "usuarios", title: "Usuários e permissões", icon: UserCog },
    { id: "configuracoes", title: "Configurações gerais", icon: Settings },
  ],
  club_manager: [
    { id: "dashboard", title: "Meu clube", icon: Shield },
    { id: "elenco", title: "Gestão de elenco", icon: Users },
    { id: "escalacao", title: "Escalação", icon: ListChecks },
    { id: "mercado", title: "Mercado BID", icon: ShoppingCart },
    { id: "transferencias", title: "Transferências", icon: ArrowLeftRight },
    { id: "financas", title: "Histórico financeiro", icon: Coins },
    { id: "competicoes", title: "Competições", icon: Trophy },
    { id: "calendario", title: "Calendário de partidas", icon: CalendarDays },
    { id: "estatisticas", title: "Estatísticas do clube", icon: ChartNoAxesCombined },
  ],
  player: [
    { id: "dashboard", title: "Perfil esportivo", icon: Contact },
    { id: "estatisticas", title: "Minhas estatísticas", icon: ChartNoAxesCombined },
    { id: "historico", title: "Histórico de clubes", icon: Shield },
    { id: "transferencias", title: "Transferências", icon: ArrowLeftRight },
    { id: "valorizacao", title: "Valorização", icon: Coins },
  ],
};

export function getPanelSection(role: AppRole, section: string) {
  return panelSections[role].find((item) => item.id === section);
}