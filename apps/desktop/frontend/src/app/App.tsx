import type { Component } from 'solid-js'

import { I18nProvider, ThemeProvider } from '@shared'

import { QueryProvider, RootErrorBoundary, SyncProvider, ToastProvider } from './providers'
import { AppRoutes } from './routes'

// Provider order matters (ADR-012):
// RootErrorBoundary > QueryProvider > SyncProvider > I18nProvider > ThemeProvider
// > ToastProvider > AppRoutes
export const App: Component = () => (
  <RootErrorBoundary>
    <QueryProvider>
      <SyncProvider>
        <I18nProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </ThemeProvider>
        </I18nProvider>
      </SyncProvider>
    </QueryProvider>
  </RootErrorBoundary>
)
