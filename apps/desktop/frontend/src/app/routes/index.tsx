import { Route, Router } from '@solidjs/router'
import { lazy } from 'solid-js'
import type { Component } from 'solid-js'

import { AppShell } from '@widgets/app-shell'

const Home = lazy(() => import('@pages/home').then((m) => ({ default: m.Home })))
const JournalPage = lazy(() => import('@pages/journal').then((m) => ({ default: m.JournalPage })))
const NotesPage = lazy(() => import('@pages/notes').then((m) => ({ default: m.NotesPage })))
const NotePage = lazy(() => import('@pages/note').then((m) => ({ default: m.NotePage })))
const EditorPage = lazy(() => import('@pages/editor').then((m) => ({ default: m.EditorPage })))
const NotFound = lazy(() => import('@pages/not-found').then((m) => ({ default: m.NotFound })))

export const AppRoutes: Component = () => (
  <Router root={AppShell}>
    <Route path="/" component={Home} />
    <Route path="/journal" component={JournalPage} />
    <Route path="/notes" component={NotesPage} />
    <Route path="/note/:id" component={NotePage} />
    <Route path="/editor" component={EditorPage} />
    <Route path="*" component={NotFound} />
  </Router>
)
