// DADOS DEMONSTRATIVOS — usados apenas para visualização da interface.
// Não representam clubes, jogadores, resultados ou informações oficiais da AFCB.

export type DemoClub = { id: string; name: string; short: string; color: string; coins: number; squadValue: number; players: number };
export type DemoPlayer = { id: string; name: string; platformId: string; position: string; clubId: string; value: number; change: number; rating: number; goals: number; assists: number; matches: number; w: number; d: number; l: number };
export type DemoCompetition = { slug: string; name: string; status: "Em andamento" | "Inscrições" | "Encerrada" | "Planejada"; format: string; season: string; clubs: number };

export const demoClubs: DemoClub[] = [
  { id: "c1", name: "Clube Exemplo Alfa", short: "ALF", color: "primary", coins: 1250000, squadValue: 3400000, players: 14 },
  { id: "c2", name: "Clube Exemplo Beta", short: "BET", color: "gold", coins: 980000, squadValue: 2900000, players: 12 },
  { id: "c3", name: "Clube Exemplo Gama", short: "GAM", color: "primary", coins: 1430000, squadValue: 3100000, players: 15 },
  { id: "c4", name: "Clube Exemplo Delta", short: "DEL", color: "gold", coins: 720000, squadValue: 2100000, players: 11 },
  { id: "c5", name: "Clube Exemplo Épsilon", short: "EPS", color: "primary", coins: 1100000, squadValue: 2650000, players: 13 },
  { id: "c6", name: "Clube Exemplo Zeta", short: "ZET", color: "gold", coins: 860000, squadValue: 2400000, players: 12 },
];

const positions = ["ATA", "PE", "PD", "MEI", "MC", "VOL", "LE", "LD", "ZAG", "GOL"];
export const demoPlayers: DemoPlayer[] = Array.from({ length: 18 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Jogador Exemplo ${String(i + 1).padStart(2, "0")}`,
  platformId: `PSN_exemplo_${i + 1}`,
  position: positions[i % positions.length]!,
  clubId: demoClubs[i % demoClubs.length]!.id,
  value: 120000 + ((i * 37) % 17) * 21000,
  change: (((i * 13) % 11) - 5) * 1.7,
  rating: 6.4 + ((i * 7) % 20) / 10,
  goals: (i * 5) % 14,
  assists: (i * 3) % 10,
  matches: 10 + (i % 8),
  w: 5 + (i % 6), d: i % 4, l: 1 + (i % 3),
}));

export const demoCompetitions: DemoCompetition[] = [
  { slug: "liga-exemplo", name: "Liga Exemplo — Série A", status: "Em andamento", format: "Pontos corridos", season: "Temporada 1", clubs: 6 },
  { slug: "copa-exemplo", name: "Copa Exemplo", status: "Inscrições", format: "Mata-mata", season: "Temporada 1", clubs: 0 },
  { slug: "supercopa-exemplo", name: "Supercopa Exemplo", status: "Planejada", format: "Jogo único", season: "Temporada 1", clubs: 0 },
];

export const demoStandings = demoClubs.map((c, i) => ({ club: c, p: 18 - i * 3, j: 8, v: 6 - i, e: i % 3, d: i, gp: 20 - i * 2, gc: 6 + i * 2 }));

export const demoFixtures = [
  { date: "Exemplo · Rodada 9", home: "c1", away: "c2", time: "21:00", comp: "Liga Exemplo — Série A" },
  { date: "Exemplo · Rodada 9", home: "c3", away: "c4", time: "21:45", comp: "Liga Exemplo — Série A" },
  { date: "Exemplo · Rodada 9", home: "c5", away: "c6", time: "22:30", comp: "Liga Exemplo — Série A" },
  { date: "Exemplo · Rodada 10", home: "c2", away: "c3", time: "21:00", comp: "Liga Exemplo — Série A" },
];

export const demoTransfers = [
  { player: "p3", from: "c1", to: "c4", amount: 185000, type: "Compra" },
  { player: "p7", from: "c2", to: "c5", amount: 142000, type: "Compra" },
  { player: "p11", from: "c6", to: "c3", amount: 0, type: "Empréstimo" },
  { player: "p14", from: "c4", to: "c1", amount: 210000, type: "Compra" },
];

export const demoNews = [
  { id: "n1", title: "Comunicado de exemplo: abertura do período de inscrições", tag: "Comunicado", excerpt: "Texto demonstrativo. As notícias oficiais serão publicadas pela administração da AFCB." },
  { id: "n2", title: "Exemplo: janela BID com regras de valorização", tag: "Mercado", excerpt: "Texto demonstrativo para visualização do layout de notícias." },
  { id: "n3", title: "Exemplo: calendário da temporada em elaboração", tag: "Calendário", excerpt: "Texto demonstrativo. Nenhuma data oficial foi definida." },
];

export const valueHistory = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"].map((w, i) => ({ w, v: 140000 + i * 9000 + ((i * 17) % 5) * 6000 }));

export const clubById = (id: string) => demoClubs.find((c) => c.id === id)!;
export const playerById = (id: string) => demoPlayers.find((p) => p.id === id)!;
export const coins = (n: number) => `${n.toLocaleString("pt-BR")} AC`;
