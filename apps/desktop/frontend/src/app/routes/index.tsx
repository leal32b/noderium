import { Route, Router } from '@solidjs/router'
import { lazy } from 'solid-js'
import type { Component } from 'solid-js'

import { AppShell } from '@widgets/app-shell'

const Home = lazy(() => import('@pages/home').then((m) => ({ default: m.Home })))
const NotFound = lazy(() => import('@pages/not-found').then((m) => ({ default: m.NotFound })))

export const AppRoutes: Component = () => (
  <Router root={AppShell}>
    <Route path="/" component={Home} />
    <Route path="*" component={NotFound} />
  </Router>
)
