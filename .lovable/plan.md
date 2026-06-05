
# Plano: Dashboard Bibly

**Nota de stack:** o projeto base é **TanStack Start** (não Vite+React puro). Vou usar TanStack Start com Tailwind v4, Shadcn, Recharts e Lovable Cloud (Supabase) — funcionalmente idêntico ao que você pediu, só muda a forma de declarar rotas (`src/routes/*.tsx` ao invés de React Router).

## 1. Backend (Lovable Cloud / Supabase)

Habilitar Cloud e criar via migrations:

**Tabelas**
- `profiles` (id uuid FK auth.users, display_name, subtitle, avatar_url, theme_intensity) + trigger auto-criar no signup com `display_name='Gabi'`
- `dashboard_metas` (singleton: m1, m2, m3, mes)
- `dashboard_ganhos` (perfil, data_ganho, quantidade, obs)
- `dashboard_planilha` (id, dados jsonb, mes)
- `reunioes_sdr` (perfil, data, reunioes, no_shows)
- `estudos_items`, `ravenna_scripts`, `ravenna_personas`, `links_uteis`, `historia_sucesso`, `carreira_niveis`

**Segurança**
- RLS em todas: `auth.uid() IS NOT NULL` (dashboard pessoal, qualquer logado vê tudo — single-tenant Gabi)
- Storage bucket `avatars` (público) para foto de perfil
- GRANTs explícitos para `authenticated` e `service_role`

**Seed**
- `dashboard_metas`: m1=121, m2=135, m3=141, mes='2026-06'
- 10 registros em `dashboard_ganhos` em 2026-06-04 (perfil='bibi')

## 2. Auth

- Login email/senha em `/auth` (signup + login num tab switcher)
- Layout `_authenticated/route.tsx` protegendo tudo, `ssr: false`
- `onAuthStateChange` no root invalidando queries
- HIBP check ativado

## 3. Design System (`src/styles.css`)

- Dark only, tokens em oklch
- `--primary` (roxo ~270), `--pink` (~330), `--warning` (laranja), `--success` (verde)
- Gradientes: `--gradient-hero` (roxo→rosa), `--gradient-primary`
- Utilitários customizados via `@utility`: `bg-gradient-hero`, `bg-gradient-primary`, `shadow-glow`, `shadow-card`
- `animate-fade-in` keyframes, transições `duration-700`

## 4. Layout

- `_authenticated/route.tsx` com `SidebarProvider`
- `AppSidebar`: logo Bibly + 10 itens (Lucide icons), collapsible="icon", item ativo com gradiente roxo→rosa
- Topbar: breadcrumb + botão "Meu Perfil" + avatar (clicável → upload)
- Botão Sair no rodapé da sidebar

## 5. Rotas (10 abas)

| Rota | Implementação |
|------|---------------|
| `/` Metas | **Completa** (ver §6) |
| `/dados` | Tabs por mês, importador de planilha (parser texto livre), card histórico maio-2026 |
| `/reunioes` | Tabela + gráfico Recharts de taxa de comparecimento via `reunioes_sdr` |
| `/pipeline` | 2 iframes Pipedrive (URLs em localStorage editáveis) |
| `/estudos` | Lista de livros/cursos com barra de progresso |
| `/ravenna` | Templates de scripts + personas para roleplay |
| `/carreira` | 9 níveis com faixas salariais |
| `/links` | Lista de links categorizados |
| `/historia` | Timeline de conquistas mensais |
| `/dashboard-cw` | Layout livre (placeholder estruturado) |

## 6. Aba Metas (`/`) — completa

- **Hero**: saudação dinâmica (Bom dia/tarde/noite + nome do perfil)
- **Card Status Meta** (gradiente hero):
  - Número grande `{total}/{m3}` com gradiente texto
  - Badge "No Ritmo / Tier X / Abaixo" (cálculo pctRitmo)
  - Barra de progresso multi-marcador (M1/M2/M3)
  - ⚙️ Dialog para editar M1/M2/M3
- **3 cards Meta 1/2/3**: fechamentos/dia necessários ou ✓
- **Linha**: Projeção Final + Dias Restantes
- **Banner semanal**
- **Botões -1/+1 ganho** + Salvar (toast)
- **EvolucaoChart** (Recharts AreaChart): acumulado azul + diário rosa tracejado
- **ReunioesDiaCard**: +/- reuniões e no-shows, % presença, salvar
- **Grid 9 métricas** (placeholders até importar planilha)
- Utilitários: `isDiaUtil`, `calcDiasUteisRestantes` com feriados 2026

## 7. Estado & Dados

- React Query (já no template) com `ensureQueryData` nos loaders
- `useProfile()` hook
- Mutations com invalidação otimista, toast via Sonner
- Parser de planilha em `src/lib/planilha-parser.ts` (regex para vídeo/no-show/leads/etc, suporta `,` e `.` e remove `R$`/`%`)
- Números com transição `duration-700` ao atualizar

## 8. Detalhes técnicos

- Server functions (`createServerFn` + `requireSupabaseAuth`) para mutações sensíveis; reads direto via client Supabase com RLS
- Upsert singletons com `onConflict: 'id'`
- Loading skeletons em todos os fetches
- localStorage: `ravenna_planilha`, `ravenna_ganhos` (fallback)

## Ordem de execução

1. Enable Cloud + migrations + seed
2. Design system + sidebar/layout + auth
3. Aba Metas completa (prioridade — é o que está no print)
4. Demais 9 abas com funcionalidade descrita

## Riscos / Observações

- **É um trabalho grande** — vai gerar bastante código de uma vez. Se algo travar ou ficar abaixo do esperado em alguma aba específica, iteramos depois.
- A spec não especifica o que vai no "Dashboard CW" — vou deixar placeholder configurável.
- Importador de planilha trata texto colado (formato Ravenna). Se você tem um formato exato, melhor me enviar um exemplo depois para refinar regex.
- Stack ajustada de Vite puro → TanStack Start (mesma DX, melhor SSR).

Posso prosseguir?
