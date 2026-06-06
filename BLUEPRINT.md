# Blueprint: Tauri + SolidJS Template Replication Guide

Este documento descreve como replicar a estrutura, configurações e padrões deste template em um novo projeto **Tauri + SolidJS** com a mesma base profissional.

**Escopo**: Arquitetura FSD, configurações de build/lint/test, design tokens, temas, i18n, command palette e shell de app. Exclui comportamentos específicos (auth, billing, workspace) — apenas página principal em branco.

---

## 1. Configuração Inicial de Build & Tooling

### 1.1 Package.json & Dependências

**Dependências principais (idênticas)**:
```json
{
  "dependencies": {
    "@kobalte/core": "^0.13.11",
    "@solid-primitives/debounce": "^1.3.0",
    "@solid-primitives/i18n": "^2.2.1",
    "@solid-primitives/keyboard": "^1.3.5",
    "@solid-primitives/storage": "^4.3.4",
    "@solidjs/router": "^0.16.1",
    "@tanstack/solid-query": "^5.100.11",
    "lucide-solid": "^1.16.0",
    "solid-js": "^1.9.3",
    "valibot": "^1.4.0"
  }
}
```

**Scripts importantes**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "prepare": "husky"
  }
}
```

### 1.2 Vite Config

```typescript
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [UnoCSS(), solid()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
```

### 1.3 TypeScript Config

**tsconfig.json**: Strict mode + module resolution para FSD + path aliases
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@pages/*": ["src/pages/*"],
      "@widgets/*": ["src/widgets/*"],
      "@features/*": ["src/features/*"],
      "@entities/*": ["src/entities/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
```

### 1.4 ESLint & Prettier

**ESLint** (flat config): Enforce FSD layer boundaries via `eslint-plugin-boundaries`
- Upper layers only import from lower layers
- No deep imports into slices — only via Public API (`index.ts`)
- Layers: `app > pages > widgets > features > entities > shared`

**Prettier**: Formato automático com `.prettierrc.json`

### 1.5 Husky + Lint-staged

Pre-commit hooks:
- ESLint + Prettier em arquivos `*.ts` / `*.tsx`
- Prettier em `*.json`, `*.css`, `*.md`

---

## 2. Arquitetura FSD (Feature-Sliced Design)

### 2.1 Estrutura de Pastas

```
src/
├── app/              # Inicialização, rotas, providers globais
│   ├── index.tsx     # Entry point (imports, inicialização)
│   ├── App.tsx       # Root component com provider stack
│   ├── providers/    # QueryProvider, RootErrorBoundary, etc
│   ├── routes/       # Lazy routes + redirects
│   └── styles/       # Global CSS, theme.css
├── pages/            # Full-screen pages (rotas)
│   ├── home/
│   ├── not-found/
│   └── [page-name]/
│       ├── ui/
│       ├── model/    (se houver state específico de página)
│       └── index.ts  # Public API
├── widgets/          # Compostos (topbar, sidebar, dialogs)
│   ├── app-shell/    # Topbar + Sidebar container
│   ├── command-palette/
│   ├── topbar/
│   ├── sidebar/
│   └── [widget]/
│       ├── ui/
│       ├── model/
│       └── index.ts
├── features/         # User-facing funcionalidades isoladas
│   ├── [feature-name]/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   └── command-defaults/ # Comandos (∧K) padrão
├── entities/         # Entidades de domínio (User, Workspace, etc)
│   ├── [entity-name]/
│   │   ├── ui/       (components de exibição da entidade)
│   │   ├── model/    (signals, stores, composables)
│   │   ├── api/      (endpoints, queries)
│   │   └── index.ts  # Public API
│   └── command/      # Modelo de Command
├── shared/           # Código reutilizável
│   ├── ui/           # Componentes base (Button, Dialog, etc)
│   ├── lib/          # Funções utilitárias
│   │   ├── theme.tsx      # Tema (light/dark/system) + density
│   │   ├── i18n.tsx       # i18n com lazy-loaded dicts
│   │   ├── observability/ # Analytics, error tracking
│   │   ├── feature-flags.tsx
│   │   └── ...
│   ├── config/       # Configurações
│   │   ├── i18n/     # Locales, dictionaries
│   │   ├── env.ts    # Env vars validadas
│   │   └── tokens/   # Design tokens
│   ├── api/          # API client, mocks (MSW)
│   └── types/        # Types compartilhados
└── test/             # Mocks, helpers de teste
```

### 2.2 Padrão de Slice

Cada slice (`pages/*`, `widgets/*`, `features/*`, `entities/*`) tem:
```
slice-name/
├── ui/              # Componentes React/Solid
│   └── SliceName.tsx
├── model/           # State management (signals, stores, composables)
│   ├── store.ts
│   └── store.test.ts
├── api/             # (opcional) requests HTTP
│   └── hooks.ts
└── index.ts         # Public API — ÚNICO ponto de import externo
```

**Public API** (`index.ts`):
```typescript
export { SliceName } from './ui/SliceName'
export { useSliceStore } from './model/store'
export type { SliceStoreValue } from './model/store'
```

**Não fazer**:
```typescript
// ❌ Importar internals
import { something } from '@features/my-feature/model/store'
// ✅ Importar apenas da Public API
import { useSliceStore } from '@features/my-feature'
```

---

## 3. Design Tokens & Theming

### 3.1 Semantic CSS Variables

**`src/app/styles/theme.css`**: Variáveis organizadas por categoria

```css
:root,
[data-theme='light'] {
  /* Surfaces */
  --surface-background: #ffffff;
  --surface-raised: #ffffff;
  --surface-sunken: #fafafa;

  /* Text */
  --text-primary: #18181b;
  --text-secondary: #52525b;
  --text-tertiary: #71717a;

  /* Borders, actions, feedback */
  --border-default: #e4e4e7;
  --action-primary-default: #2563eb;
  --feedback-success-bg: #f0fdf4;
  /* ... mais variáveis */
}

[data-theme='dark'] {
  /* inversão de cores */
}
```

**Aplicação**:
- Trocar tema = alterar `data-theme` no `<html>` (sem rebuild)
- Multi-brand: sobrescrever `--action-primary-*` dinamicamente para cor do workspace

### 3.2 Theme Provider

**`src/shared/lib/theme.tsx`**:
```typescript
export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setTheme] = makePersisted(
    createSignal<Theme>('system'),
    { name: 'theme', deserialize: ... }
  )
  const [density, setDensity] = makePersisted(
    createSignal<Density>('comfortable'),
    { name: 'density', deserialize: ... }
  )

  const resolvedTheme = (): ResolvedTheme => {
    return theme() === 'system' ? resolveSystem() : theme()
  }

  createEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme())
    document.documentElement.setAttribute('data-density', density())
  })

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, density, setDensity }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
```

---

## 4. Internacionalização (i18n)

### 4.1 Estrutura de Dicionários

```
src/shared/config/i18n/
├── dictionaries/
│   ├── en-US.ts      # Dicionário padrão (bundled)
│   ├── pt-BR.ts      # Lazy-loaded
│   └── index.ts      # Loader map
├── locales.ts        # Lista de locales suportadas
└── index.ts          # Exports
```

**Formato de dicionário**:
```typescript
// en-US.ts
export default {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
  },
  navigation: {
    home: 'Home',
    settings: 'Settings',
  },
} as const
```

### 4.2 i18n Provider

**`src/shared/lib/i18n.tsx`**:
- Browser locale detection
- Persistent locale preference
- Lazy-loaded dictionaries (non-default)
- `Intl` formatters (date, number, currency, relative time)
- `<html lang>` e `<html dir>` em sync

```typescript
export const I18nProvider: ParentComponent = (props) => {
  const [stored, setStored] = makePersisted(
    createSignal<Locale>(detectBrowserLocale()),
    { name: 'locale', deserialize: ... }
  )

  const locale = createMemo<Locale>(() => 
    isLocale(stored()) ? stored() : DEFAULT_LOCALE
  )

  const [dict] = createResource(
    locale,
    async (loc) => {
      const mod = await dictionaryLoaders[loc]()
      return flatten(mod.default) as FlatDictionary
    },
    { initialValue: flattenedDefaultDict }
  )

  const t = translator(() => dict() ?? fallbackFlat)

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatDate, ... }}>
      {props.children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
```

**Uso**:
```typescript
const { t, formatDate, locale } = useI18n()

<button>{t('common.ok')}</button>
<p>{formatDate(new Date(), { dateStyle: 'long' })}</p>
```

---

## 5. App Shell: Topbar, Sidebar, Command Palette

### 5.1 AppShell Structure

**`src/widgets/app-shell/ui/AppShell.tsx`**:
```typescript
export const AppShell: ParentComponent = (props) => (
  <Show when={!sessionBootstrapping()} fallback={<AuthSplash />}>
    <Show when={session.isAuthenticated()} fallback={<RedirectToSignIn />}>
      <AuthedShell>{props.children}</AuthedShell>
    </Show>
  </Show>
)

const AuthedShell: ParentComponent = (props) => {
  const [sidebarOpen, setSidebarOpen] = createSignal(false)

  useDefaultCommands()
  useCommandPaletteShortcut()

  return (
    <div class="flex h-screen flex-col bg-surface-background text-text-primary">
      <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div class="flex min-h-0 flex-1">
        <Sidebar open={sidebarOpen()} onClose={() => setSidebarOpen(false)} />
        <main id="main" class="min-w-0 flex-1 overflow-y-auto p-6">
          {props.children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
```

### 5.2 Command Palette

**Modelo de Command**:
```typescript
// src/entities/command/model/store.ts
export interface Command {
  id: string
  title: string
  shortcut?: string
  group: 'navigate' | 'actions' | 'account'
  execute: () => void
  hidden?: boolean
}
```

**Uso de commands em features**:
```typescript
// src/features/command-defaults/index.ts
export function useDefaultCommands() {
  const commands = useCommandStore()
  
  createEffect(() => {
    commands.register([
      { id: 'nav.home', title: 'Go to Home', group: 'navigate', execute: () => navigate('/') },
      { id: 'nav.settings', title: 'Go to Settings', group: 'navigate', execute: () => navigate('/settings') },
    ])
  })
}
```

### 5.3 Keyboard Shortcuts

Usar `@solid-primitives/keyboard` para detectar ⌘K / Ctrl+K e abrir a paleta.

---

## 6. Providers Stack

**`src/app/App.tsx`**: Order matters
```typescript
export const App: Component = () => (
  <RootErrorBoundary>
    <QueryProvider>
      <RealtimeProvider>
        <I18nProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </ThemeProvider>
        </I18nProvider>
      </RealtimeProvider>
    </QueryProvider>
  </RootErrorBoundary>
)
```

---

## 7. Design Patterns & Conventions

### 7.1 State Management

- **Server state** (API data): TanStack Query (`@tanstack/solid-query`)
- **Client state** (UI toggles, local): Solid signals
- **Persistent state** (localStorage): `makePersisted(createSignal(...))`
- **Shareable state** (URL params): Router integration

### 7.2 API Integration

- **Valibot schemas**: Validam responses na boundary
- **Error handling**: Mapping de erros da API para mensagens i18n
- **Composables**: Hooks que encapsulam query + signal logic

```typescript
// src/entities/workspace/api/hooks.ts
export function useCurrentWorkspace() {
  const query = createQuery(() => ({
    queryKey: ['workspace', 'current'],
    queryFn: async () => {
      const res = await fetch('/api/workspace/current')
      return WorkspaceSchema.parse(await res.json())
    },
  }))
  return query
}
```

### 7.3 Componentes Base

Kobalte + UnoCSS + design tokens:
```typescript
// src/shared/ui/Button.tsx
export interface ButtonProps extends Kobalte.Button.RootProps {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: Component<ButtonProps> = (props) => (
  <Kobalte.Button.Root
    class={cx(
      'focus-ring px-3 py-2 font-medium rounded transition',
      props.variant === 'primary' && 'bg-action-primary-default text-action-primary-text',
      props.variant === 'secondary' && 'bg-action-secondary-default text-text-primary',
    )}
    {...props}
  />
)
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)

```typescript
// src/shared/lib/brand.test.ts
import { describe, it, expect } from 'vitest'
import { applyBrand, clearBrand } from './brand'

describe('brand', () => {
  it('applies brand colors to CSS variables', () => {
    applyBrand({ primary: '#2563eb' })
    expect(document.documentElement.style.getPropertyValue('--action-primary-default')).toBe('#2563eb')
  })
})
```

### 8.2 Component Tests

Use `@solidjs/testing-library`:
```typescript
import { render } from '@solidjs/testing-library'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(() => <MyComponent />)
    expect(getByText('Hello')).toBeInTheDocument()
  })
})
```

### 8.3 E2E Tests (Playwright)

Para fluxos críticos (auth, navegação, commands).

---

## 9. UnoCSS Setup

**`uno.config.ts`** (ou inline em `vite.config.ts`):

```typescript
import { presetUno } from '@unocss/preset-uno'

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      // Semantic tokens usam CSS vars
      'surface-background': 'var(--surface-background)',
      'text-primary': 'var(--text-primary)',
      // ...
    },
  },
})
```

Padrões de uso:
```typescript
// Composição simples
<div class="flex gap-2 p-4 rounded bg-surface-raised text-text-primary" />

// Utilities diretos
<button class="focus-ring px-3 py-2 rounded transition" />
```

---

## 10. Observability Setup

**`src/shared/lib/observability/`**: Pluggable analytics + error tracking
- Web Vitals RUM
- Global error handler
- Event tracking para user interactions

Deferred para não bloquear render inicial.

---

## 11. Arquivo de Configuração & Environment

**`.env.example`**:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_FEATURE_FLAGS={"feature-x": true}
```

**`src/shared/config/env.ts`**: Validação com Valibot
```typescript
import * as v from 'valibot'

const EnvSchema = v.object({
  VITE_API_BASE_URL: v.pipe(v.string(), v.url()),
})

export const env = v.parse(EnvSchema, import.meta.env)
```

---

## 12. Checklist para Novo Projeto

**Setup:**
- [ ] Initialize Tauri project (or SPA para web)
- [ ] npm install dependências (package.json)
- [ ] Copy `vite.config.ts`, `tsconfig.json`
- [ ] Copy ESLint + Prettier configs
- [ ] Setup Husky + lint-staged
- [ ] Copy `src/app/styles/theme.css`

**Estrutura FSD:**
- [ ] Create `src/{app,pages,widgets,features,entities,shared}` directories
- [ ] `src/app/{index.tsx, App.tsx, providers, routes, styles}`
- [ ] `src/shared/{ui, lib, config, api, types}`

**Temas:**
- [ ] Copy `src/shared/lib/theme.tsx` (ou adapt)
- [ ] Copy `src/app/styles/theme.css` com tokens semânticos
- [ ] Wire `<ThemeProvider>` no App.tsx

**i18n:**
- [ ] Copy `src/shared/config/i18n/` com locales suportadas
- [ ] Copy `src/shared/lib/i18n.tsx`
- [ ] Create dicionários em `src/shared/config/i18n/dictionaries/`
- [ ] Wire `<I18nProvider>` no App.tsx

**App Shell:**
- [ ] Create `src/widgets/app-shell` (AppShell.tsx com Topbar + Sidebar)
- [ ] Create `src/widgets/topbar`, `src/widgets/sidebar`
- [ ] Create `src/entities/command` com modelo de Command
- [ ] Create `src/widgets/command-palette` com listener ⌘K

**Home Page:**
- [ ] Create `src/pages/home/ui/Home.tsx` — página em branco
- [ ] Wire em `src/app/routes/`

**Providers:**
- [ ] Create `src/app/providers/{query.tsx, error-boundary.tsx, index.ts}`
- [ ] Stack em `src/app/App.tsx`

**Testing:**
- [ ] Setup Vitest config
- [ ] Create `src/test/` com mocks + helpers
- [ ] Copy `.github/workflows/` para CI

---

## 13. Palavras-chave para o Novo Prompt

Quando ativar um novo prompt com esse blueprint, use:

> "I want to replicate the **template-frontend** structure in a new **Tauri + SolidJS** project. Use **BLUEPRINT.md** as reference. Setup: FSD (app → pages → widgets → features → entities → shared), theme provider (light/dark/system + density), i18n with lazy dicts, command palette (⌘K), app shell (topbar + sidebar), **no auth/billing/workspace logic** — just blank home page. Use same deps, eslint flat config, husky, vite, vitest, unocss, kobalte."

---

## Referências Rápidas

| Aspecto | Arquivo/Local | Padrão |
|--------|---------------|--------|
| Estrutura FSD | `eslint.config.js` | Boundaries enforced via plugin |
| Temas | `src/app/styles/theme.css` | CSS vars + `data-theme` attribute |
| i18n | `src/shared/lib/i18n.tsx` | Lazy dicts + Intl formatters |
| Commands | `src/entities/command/model` | Register + execute via paleta |
| Topbar/Sidebar | `src/widgets/app-shell` | Layout shell com <Outlet /> |
| Public API | cada `slice/index.ts` | Exports apenas públicos |
| Testing | `vitest.config.ts` | Unit + component + e2e (Playwright) |

---

## Notas Finais

1. **Mantenha FSD**: Strict enforcement de boundaries protege a arquitetura conforme o projeto cresce.
2. **Temas não bloqueiam**: Mudar `data-theme` é instantâneo; nenhum rebuild necessário.
3. **i18n lazy**: Default (en-US) é bundled; outras locales carregam on-demand.
4. **Command palette**: Motor central de navegação e ações — adicione comandos novos em `useDefaultCommands()`.
5. **Providers em ordem**: Nesting order importa; observe `src/app/App.tsx`.
