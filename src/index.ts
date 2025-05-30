import type { UnpluginOptions } from 'unplugin'
import type {
  Options,
} from './options'
import { join } from 'pathe'
import { createUnplugin } from 'unplugin'
import { createFilter } from 'unplugin-utils'
import { createRoutesContext } from './core/context'
import { MACRO_DEFINE_PAGE_QUERY } from './core/definePage'
import {
  asVirtualId as _asVirtualId,
  getVirtualId as _getVirtualId,
  MODULE_ROUTES_PATH,
  MODULE_VUE_ROUTER_AUTO,
  ROUTE_BLOCK_ID,
  routeBlockQueryRE,
  ROUTES_LAST_LOAD_TIME,
} from './core/moduleConstants'
import { appendExtensionListToPattern } from './core/utils'
import { createViteContext } from './core/vite'
import { createAutoExportPlugin } from './data-loaders/auto-exports'
import {
  DEFAULT_OPTIONS,
  mergeAllExtensions,
  resolveOptions,
} from './options'

export { EditableTreeNode } from './core/extendRoutes'

export { DEFAULT_OPTIONS }

// Route Tree and edition
export { createTreeNodeValue } from './core/treeNodeValue'
export { getFileBasedRouteName, getPascalCaseRouteName } from './core/utils'

export default createUnplugin<Options | undefined>((opt = {}, _meta) => {
  const options = resolveOptions(opt)
  const ctx = createRoutesContext(options)

  function getVirtualId(id: string) {
    if (options._inspect)
      return id
    return _getVirtualId(id)
  }

  function asVirtualId(id: string) {
    // for inspection
    if (options._inspect)
      return id
    return _asVirtualId(id)
  }

  // create the transform filter to detect `definePage()` inside page component
  const pageFilePattern = appendExtensionListToPattern(
    options.filePatterns,
    mergeAllExtensions(options),
  )

  // this is a larger filter that includes a bit too many files
  // the RouteFolderWatcher will filter it down to the actual files
  const filterPageComponents = createFilter(
    [
      ...options.routesFolder.flatMap(routeOption =>
        pageFilePattern.map(pattern => join(routeOption.src, pattern)),
      ),
      // importing the definePage block
      /\?.*\bdefinePage&vue\b/,
    ],
    options.exclude,
  )

  const plugins: UnpluginOptions[] = [
    {
      name: 'vite-plugin-routes',
      enforce: 'pre',

      resolveId(id) {
        if (
          // vue-router/auto-routes
          id === MODULE_ROUTES_PATH
          // NOTE: it wasn't possible to override or add new exports to vue-router
          // so we need to override it with a different package name
          || id === MODULE_VUE_ROUTER_AUTO
        ) {
          // virtual module
          return asVirtualId(id)
        }

        // this allows us to skip the route block module as a whole since we already parse it
        if (routeBlockQueryRE.test(id)) {
          return ROUTE_BLOCK_ID
        }

        // nothing to do, just for TS
      },

      buildStart() {
        return ctx.scanPages(options.watch)
      },

      buildEnd() {
        ctx.stopWatcher()
      },

      // we only need to transform page components
      transformInclude(id) {
        // console.log('filtering ' + id, filterPageComponents(id) ? '✅' : '❌')
        return filterPageComponents(id)
      },

      transform(code, id) {
        // console.log('👋  Transforming', id)
        // remove the `definePage()` from the file or isolate it
        return ctx.definePageTransform(code, id)
      },

      // loadInclude is necessary for webpack
      loadInclude(id) {
        if (id === ROUTE_BLOCK_ID)
          return true
        const resolvedId = getVirtualId(id)
        return (
          resolvedId === MODULE_ROUTES_PATH
          || resolvedId === MODULE_VUE_ROUTER_AUTO
        )
      },

      load(id) {
        // remove the <route> block as it's parsed by the plugin
        // stub it with an empty module
        if (id === ROUTE_BLOCK_ID) {
          return {
            code: `export default {}`,
            map: null,
          }
        }

        // we need to use a virtual module so that vite resolves the vue-router/auto-routes
        // dependency correctly
        const resolvedId = getVirtualId(id)

        // vue-router/auto-routes
        if (resolvedId === MODULE_ROUTES_PATH) {
          ROUTES_LAST_LOAD_TIME.update()
          return ctx.generateRoutes()
        }

        // vue-router/auto
        if (resolvedId === MODULE_VUE_ROUTER_AUTO) {
          return ctx.generateVueRouterProxy()
        }

        // ok TS...
      },

      // improves DX
      vite: {
        configureServer(server) {
          ctx.setServerContext(createViteContext(server))
        },

        handleHotUpdate: {
          order: 'post',
          handler({ server, file, modules }) {
            // console.log(`🔥 HMR ${file}`)
            const moduleList = server.moduleGraph.getModulesByFile(file)
            const definePageModule = Array.from(moduleList || []).find(
              (mod) => {
                return mod?.id && MACRO_DEFINE_PAGE_QUERY.test(mod.id)
              },
            )

            if (definePageModule) {
              // console.log(`Updating ${definePageModule.file}`)
              const routesModule = server.moduleGraph.getModuleById(
                asVirtualId(MODULE_ROUTES_PATH),
              )

              if (!routesModule) {
                console.error('🔥 HMR routes module not found')
                return
              }

              return [
                ...modules,
                // TODO: only if the definePage changed
                definePageModule,
                // TODO: only if ether the definePage or the route block changed
                routesModule,
              ]
            }

            // for ts
          },
        },
      },
    },
  ]

  // Experimental options
  if (options.experimental.autoExportsDataLoaders) {
    plugins.push(
      createAutoExportPlugin({
        filterPageComponents,
        loadersPathsGlobs: options.experimental.autoExportsDataLoaders,
        root: options.root,
      }),
    )
  }

  return plugins
})

export { createRoutesContext }
export { AutoExportLoaders } from './data-loaders/auto-exports'

export type { AutoExportLoadersOptions } from './data-loaders/auto-exports'
export type * from './types'

/**
 * Adds useful auto imports to the AutoImport config:
 * @example
 * ```js
 * import { VueRouterAutoImports } from 'vite-plugin-routes'
 *
 * AutoImport({
 *   imports: [VueRouterAutoImports],
 * }),
 * ```
 */
export const VueRouterAutoImports: Record<
  string,
  Array<string | [importName: string, alias: string]>
> = {
  'vue-router': [
    'useRoute',
    'useRouter',
    'onBeforeRouteUpdate',
    'onBeforeRouteLeave',
    // NOTE: the typing seems broken locally, so instead we export it directly from vite-plugin-routes/runtime
    // 'definePage',
  ],
  'vite-plugin-routes/runtime': [],
}
