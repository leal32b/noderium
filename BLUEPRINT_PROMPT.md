# Prompt Template para Novo Projeto Tauri + SolidJS

Use este prompt com um novo Claude Code para replicar a estrutura completa:

---

## Versão Completa (Recomendada)

```
I want to bootstrap a new Tauri + SolidJS project with production-grade structure. 
Use the BLUEPRINT.md from template-frontend (https://github.com/your-org/template-frontend) 
as the complete reference for architecture, configuration, and design patterns.

SCOPE (replicar tudo):
- Feature-Sliced Design: app → pages → widgets → features → entities → shared
- ESLint flat config with FSD boundary enforcement
- TypeScript strict mode + Vite + Vitest + Prettier + Husky
- Theme system: light/dark/system + density (CSS vars, no flash)
- i18n: lazy-loaded dicts, browser detection, Intl formatters
- Command palette (⌘K) with keyboard shortcuts
- App shell: topbar + sidebar + main area
- Design tokens (semantic colors via CSS variables)
- UnoCSS for atomic styling + Kobalte for headless UI
- Observability hooks (deferred to not block initial render)

EXCLUDE (no business logic):
- Authentication flows (no login, sign-up, password reset)
- Workspace, membership, RBAC
- Billing, payment methods, invoices
- Notifications/audit logs (just the shell infrastructure)
- User entity logic (just the provider skeleton)

DELIVERABLES:
1. Full folder structure (FSD)
2. All config files (vite, ts, eslint, prettier, husky)
3. App.tsx with stacked providers
4. Blank home page at /
5. AppShell with Topbar + Sidebar (no active features)
6. Command palette with basic navigate commands
7. Theme provider + theme.css with light/dark vars
8. i18n provider + 2 sample locales (en-US, pt-BR)
9. Base UI components (Button, Card, Dialog, Input)
10. index.html entry point
11. package.json with all dependencies
12. .env.example, env.ts validation
13. Unit test example (Vitest)
14. Git hooks: lint-staged + commitlint
15. Storybook setup (optional but recommended)

ARCHITECTURE CONSTRAINTS:
- App layer imports: app, pages, widgets, features, entities, shared
- Pages import: widgets, features, entities, shared
- Widgets import: widgets (composition), features, entities, shared
- Features import: entities, shared
- Entities import: shared
- Shared imports: shared
- All cross-slice imports ONLY via Public API (index.ts)
- ESLint enforces these via boundaries plugin

CONVENTIONS:
- Semantic colors as CSS vars: --surface-*, --text-*, --action-*, --border-*, --feedback-*
- Theme switch via data-theme attribute on <html> (instant, no rebuild)
- i18n: t('namespace.key'), formatDate(), formatNumber(), formatCurrency()
- Commands: register in useDefaultCommands(), group by category
- State: TanStack Query (server), signals (client), makePersisted (localStorage)
- Components: Kobalte headless + UnoCSS utilities + focus-ring class
- Error handling: RootErrorBoundary at app level
- Observability: deferred to microtask after first paint

START COMMANDS (after generation):
npm install
npm run dev            # Vite at :5173
npm run storybook      # Optional but useful
npm run test           # Vitest
npm run lint:fix       # Auto-format on save

REFERENCE FILES FROM TEMPLATE-FRONTEND:
- vite.config.ts (adapt if Tauri requires special handling)
- eslint.config.js (copy as-is)
- tsconfig.json (copy, adjust paths if needed)
- src/app/{index.tsx, App.tsx, styles/theme.css} (copy patterns)
- src/shared/lib/{theme.tsx, i18n.tsx} (copy as-is)
- src/shared/config/i18n/ (copy structure, translate strings if needed)
- src/widgets/app-shell (copy layout pattern)
- src/shared/ui/Button.tsx (example base component)

If Tauri integration (not just web SPA): adjust Vite config for Tauri build, handle 
file:// protocol in API calls if needed. Otherwise, assume web SPA at localhost:5173.
```

---

## Versão Curta (Se já você tem o BLUEPRINT.md acessível)

```
Bootstrap new Tauri + SolidJS project. Follow BLUEPRINT.md exactly:
- FSD structure (app > pages > widgets > features > entities > shared)
- All configs: vite, ts, eslint flat, prettier, husky, commitlint
- Theme provider (light/dark/system) + theme.css with semantic tokens
- i18n provider (lazy dicts, Intl formatters)
- AppShell (topbar + sidebar) + command palette (⌘K)
- Blank home page only (no auth, billing, workspace logic)
- Base UI components + providers stack
- Copy patterns from template-frontend

Deliverable: Git-ready, fully typed, ESLint + Prettier clean, tests passing.
```

---

## Checklist para Verificar (Após conclusão)

```
Architecture:
- [ ] FSD directories exist (app, pages, widgets, features, entities, shared)
- [ ] Each slice has ui/, model/, api/ (where applicable) + index.ts
- [ ] No deep imports (all via public API)
- [ ] ESLint boundaries enforced (npm run lint shows no violations)

Configs:
- [ ] vite.config.ts with path aliases (@app, @pages, etc)
- [ ] tsconfig.json with paths matching aliases
- [ ] eslint.config.js with FSD boundary rules
- [ ] .prettierrc.json + .prettierignore
- [ ] .husky/pre-commit with lint-staged
- [ ] commitlint.config.js

Theming:
- [ ] src/app/styles/theme.css with light/dark vars
- [ ] ThemeProvider in src/shared/lib/theme.tsx
- [ ] useTheme() hook available
- [ ] data-theme attribute on <html> synced

i18n:
- [ ] src/shared/config/i18n/dictionaries/{en-US, pt-BR}.ts
- [ ] I18nProvider in src/shared/lib/i18n.tsx
- [ ] useI18n() hook with t(), formatDate(), etc
- [ ] <html lang> synced

App Shell:
- [ ] AppShell component at src/widgets/app-shell
- [ ] Topbar + Sidebar components
- [ ] Command palette accessible via ⌘K
- [ ] Command entity + store
- [ ] useDefaultCommands hook registering basic commands

Home Page:
- [ ] src/pages/home/ui/Home.tsx (blank, ready for content)
- [ ] Routable at /
- [ ] Inside AppShell (topbar + sidebar visible)

Providers:
- [ ] RootErrorBoundary
- [ ] QueryProvider (TanStack Query)
- [ ] I18nProvider
- [ ] ThemeProvider
- [ ] ToastProvider
- [ ] All stacked in App.tsx in correct order

Testing:
- [ ] vitest.config.ts exists
- [ ] Sample test file (e.g., theme.test.ts) passes
- [ ] npm run test runs without errors

Linting:
- [ ] npm run lint passes (no warnings)
- [ ] npm run format:check passes
- [ ] npm run typecheck passes

Git:
- [ ] .gitignore includes dist, node_modules, .env, etc
- [ ] .git initialized
- [ ] First commit: "chore: initial project setup"
```

---

## Troubleshooting for the New Prompt

If the prompt gets stuck or incomplete:

1. **"Too many files to create"** → Break into phases:
   - Phase 1: Configs + folder structure
   - Phase 2: Providers + App.tsx
   - Phase 3: Widgets (topbar, sidebar, command-palette)
   - Phase 4: Pages + routes
   - Phase 5: Shared lib (theme, i18n, ui)

2. **"ESLint boundaries not working"** → Ensure eslint.config.js has:
   ```js
   settings: {
     'boundaries/elements': [
       { type: 'app', pattern: 'src/app/**' },
       { type: 'pages', pattern: 'src/pages/*', capture: ['slice'] },
       // ...
     ],
   }
   ```

3. **"Theme not switching"** → Verify:
   - `<ThemeProvider>` in App.tsx
   - `createEffect` syncs `data-theme` to `<html>`
   - CSS vars in theme.css use `var(--token-name)`

4. **"i18n showing blank strings"** → Check:
   - Default dict (en-US) bundled, not lazy-loaded
   - Dictionary loaders in src/shared/config/i18n/dictionaries/index.ts
   - `fallbackFlat` set to default dict flattened

5. **"Command palette not opening"** → Verify:
   - `useCommandPaletteShortcut()` called in AppShell
   - Keyboard listener on ⌘K / Ctrl+K
   - `<CommandPalette />` mounted at bottom of shell

---

## After Bootstrap: Next Steps

1. **Rename project**: Update package.json name, git remote
2. **Add your API**: Create entities/{your-domain}/ with api/model/ui layers
3. **Integrate auth**: Extend user entity, create auth flows in features/
4. **Add pages**: Create new pages/{page}/ for your domain
5. **Refine design**: Customize theme.css colors, density tokens, density system
6. **Storybook**: Document components as you build them
7. **E2E tests**: Add critical user flows (Playwright)
8. **Deploy**: Setup CI/CD for build + tests + performance budgets (size-limit)
