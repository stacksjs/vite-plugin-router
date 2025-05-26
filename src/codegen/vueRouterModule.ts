// NOTE: this code needs to be generated because otherwise it doesn't go through transforms and `vue-router/auto-routes`

import { ts } from "../utils";
import type { ResolvedOptions } from "../options";

// cannot be resolved.
export function generateVueRouterProxy(
  _routesModule: string,
  _options: ResolvedOptions,
  { addPiniaColada }: { addPiniaColada: boolean },
) {
  return ts`
import { createRouter as _createRouter } from 'vue-router'

export * from 'vue-router'
export { definePage } from 'vite-plugin-router/runtime'
export {
  DataLoaderPlugin,
  NavigationResult,
} from 'vite-plugin-router/data-loaders'

export * from 'vite-plugin-router/data-loaders/basic'
${addPiniaColada ? "export * from 'vite-plugin-router/data-loaders/pinia-colada'" : ""}

export function createRouter(options) {
  const { extendRoutes, routes } = options
  if (extendRoutes) {
    console.warn('"extendRoutes()" is deprecated, please modify the routes directly. See https://uvr.esm.is/guide/extending-routes.html#extending-routes-at-runtime for an alternative.')
  }
  // use Object.assign for better browser support
  const router = _createRouter(Object.assign(
    options,
    { routes: typeof extendRoutes === 'function' ? (extendRoutes(routes) || routes) : routes },
  ))

  return router
}
`.trimStart();
}

// FIXME: remove `extendRoutes()` in the next major version
