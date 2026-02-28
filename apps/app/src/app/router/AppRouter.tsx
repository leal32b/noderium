import { Router } from '@solidjs/router'
import { lazy } from 'solid-js'

import { PATHS } from '@/shared/config'

const routes = [
  {
    component: lazy(() => import('@/pages/note').then(m => ({ default: m.NotePage }))),
    path: PATHS.note()
  }
]

const AppRouter = () => {
  return <Router>{routes}</Router>
}

/* v8 ignore next -- @preserve */
export { AppRouter }
