import { Route, Router } from '@solidjs/router'
import { lazy } from 'solid-js'
import type { Component } from 'solid-js'

import { AppShell } from '@widgets/app-shell'

const Home = lazy(() => import('@pages/home').then((m) => ({ default: m.Home })))
const JournalPage = lazy(() => import('@pages/journal').then((m) => ({ default: m.JournalPage })))
const EditorPage = lazy(() => import('@pages/editor').then((m) => ({ default: m.EditorPage })))
const NotFound = lazy(() => import('@pages/not-found').then((m) => ({ default: m.NotFound })))

export const AppRoutes: Component = () => (
  <Router root={AppShell}>
    <Route path="/" component={Home} />
    <Route path="/journal" component={JournalPage} />
    <Route path="/editor" component={EditorPage} />
    <Route path="*" component={NotFound} />
  </Router>
)
