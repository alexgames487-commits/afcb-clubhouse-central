# Afcb Clubhouse Central

Crie uma plataforma web profissional chamada AFCB — Associação Federativa Clubs Brasil, destinada à administração de uma federação de clubes de EA SPORTS FC 26, modalidade Pro Clubs, exclusivamente Old Gen.



IMPORTANTE: Este projeto NÃO é um jogo. É um sistema completo de administração esportiva, gerenciamento de clubes, jogadores, competições, mercado de transferências e gestão financeira.



O objetivo é construir uma plataforma moderna, dinâmica, responsiva e escalável, com aparência de um sistema oficial de uma entidade esportiva.



1. IDENTIDADE VISUAL



Utilize uma identidade visual esportiva e institucional.



Cores principais:



- Azul-ciano como cor de destaque.

- Dourado como cor secundária.

- Azul-marinho muito escuro como base.

- Branco e cinza para textos e superfícies.



O design deve transmitir profissionalismo, tecnologia, organização e autoridade esportiva.



Utilize:



- Interface moderna e sofisticada.

- Cards com bordas discretas.

- Ícones minimalistas.

- Gráficos e indicadores.

- Tabelas esportivas profissionais.

- Menus laterais.

- Animações discretas.

- Excelente experiência em computadores e celulares.



Evite aparência de template genérico ou site institucional simples.



2. ESTRUTURA PRINCIPAL



Crie as seguintes áreas:



SITE PÚBLICO



- Página inicial.

- Sobre a AFCB.

- Competições.

- Clubes filiados.

- Jogadores registrados.

- Mercado de jogadores.

- Notícias e comunicados.

- Rankings e estatísticas.

- Calendário esportivo.

- Regulamentos.

- Login e cadastro.



ÁREA DO USUÁRIO



Crie uma estrutura de autenticação preparada para quatro tipos de acesso:



1. Superadministrador: proprietário da plataforma, com controle total.

2. Gestor do Clube: uma única função que reúne as responsabilidades de presidente e treinador.

3. Jogador: possui perfil esportivo individual.

4. Visitante: acessa somente informações públicas.



PAINEL DO SUPERADMINISTRADOR



Criar um dashboard administrativo com:



- Total de clubes cadastrados.

- Total de jogadores registrados.

- Competições ativas.

- Competições encerradas.

- Janelas BID abertas.

- Movimentações recentes.

- Volume financeiro da federação.

- Solicitações pendentes.

- Atividade recente da plataforma.



Criar menu administrativo com:



- Dashboard.

- Clubes.

- Jogadores.

- Competições.

- Mercado BID.

- Transferências.

- Finanças.

- Estatísticas.

- Notícias.

- Regulamentos.

- Usuários e permissões.

- Configurações gerais.



PAINEL DO GESTOR DO CLUBE



Criar um dashboard individual para cada clube.



Funcionalidades visuais:



- Identificação do clube e escudo.

- Patrimônio atual em AFCB Coins.

- Valor total do elenco.

- Lista de jogadores.

- Gestão de elenco.

- Escalação.

- Mercado BID.

- Transferências.

- Histórico financeiro.

- Competições disputadas.

- Calendário de partidas.

- Estatísticas do clube.



PAINEL DO JOGADOR



Criar perfil esportivo individual com:



- Foto ou avatar.

- Nome esportivo.

- ID da plataforma.

- Posição.

- Clube atual.

- Valor de mercado.

- Média de notas.

- Gols.

- Assistências.

- Partidas.

- Vitórias, empates e derrotas.

- Estatísticas defensivas.

- Histórico de clubes.

- Histórico de transferências.

- Gráfico de valorização.



3. ESTRUTURA DAS COMPETIÇÕES



Criar uma área de competições que permita futuramente administrar diversos campeonatos independentes.



Cada competição deverá possuir sua própria página, preparada para:



- Participantes.

- Regulamento.

- Tabela de classificação.

- Rodadas.

- Jogos.

- Resultados.

- Súmulas.

- Artilharia.

- Assistências.

- Estatísticas.

- Premiações.



4. SISTEMA DE MERCADO



Criar a interface inicial do AFCB MARKET.



A moeda oficial será chamada AFCB Coins.



Preparar visualmente:



- Valor de mercado dos jogadores.

- Valorização e desvalorização.

- Ranking de jogadores mais valorizados.

- Histórico de preços.

- Lista de jogadores disponíveis.

- Movimentações de transferências.

- Histórico de negociações.



5. ARQUITETURA E TECNOLOGIA



Utilize:



- React.

- TypeScript.

- Tailwind CSS.

- Componentes reutilizáveis.

- Supabase para banco de dados e autenticação.

- Supabase Storage para imagens e documentos.



Organize o código em módulos independentes, com estrutura escalável.



Prepare uma arquitetura de permissões baseada em funções e relacionamentos entre usuários, clubes, jogadores e competições.



6. ORIENTAÇÕES IMPORTANTES



- Não construir um jogo.

- Não utilizar estética de videogame arcade.

- Não criar apenas uma landing page.

- Criar uma plataforma administrativa real, com navegação entre páginas.

- Não deixar botões importantes sem uma ação ou destino definido.

- Utilizar dados demonstrativos apenas quando necessário, identificando-os como exemplos.

- Não inventar resultados ou informações oficiais.

- Preparar a estrutura para futuras integrações e funcionalidades.

- Priorizar uma excelente primeira impressão visual.



RESULTADO ESPERADO



Entregar a primeira versão visual e navegável da plataforma AFCB, com site público, estrutura de login, dashboards por perfil e painéis administrativos.



A plataforma deve parecer um sistema oficial de uma federação esportiva profissional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/254b57f0-3619-4644-9320-0b9124b0f315).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
