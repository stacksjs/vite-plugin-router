import type { UnpluginOptions } from 'unplugin'
import type { Plugin } from 'vite'
import MagicString from 'magic-string'
import { findStaticImports, parseStaticImport } from 'mlly'
import { resolve } from 'pathe'
import { createFilter } from 'unplugin-utils'

export function extractLoadersToExport(
  code: string,
  filterPaths: (id: string) => boolean,
  root: string,
): string[] {
  const imports = findStaticImports(code)
  const importNames = imports.flatMap((i) => {
    const parsed = parseStaticImport(i)

    // since we run post-post, vite will add a leading slash to the specifier
    const specifier = resolve(
      root,
      parsed.specifier.startsWith('/')
        ? parsed.specifier.slice(1)
        : parsed.specifier,
    )

    // bail out faster for anything that is not a data loader
    if (!filterPaths(specifier))
      return []

    return [
      parsed.defaultImport,
      ...Object.values(parsed.namedImports || {}),
    ].filter((v): v is string => !!v && !v.startsWith('_'))
  })

  return importNames
}

const PLUGIN_NAME = 'vite-plugin-routes:data-loaders-auto-export'

/**
 * {@link AutoExportLoaders} options.
 */
export interface AutoExportLoadersOptions {
  /**
   * Filter page components to apply the auto-export (defined with `createFilter()` from `unplugin-utils`) or array
   * of globs.
   */
  filterPageComponents: ((id: string) => boolean) | string[]

  /**
   * Globs to match the paths of the loaders.
   */
  loadersPathsGlobs: string | string[]

  /**
   * Root of the project. All paths are resolved relatively to this one.
   * @default `process.cwd()`
   */
  root?: string
}

/**
 * Vite Plugin to automatically export loaders from page components.
 *
 * @param options Options
 * @experimental - This API is experimental and can be changed in the future. It's used internally by `experimental.autoExportsDataLoaders`
 
 */
export function AutoExportLoaders({
  filterPageComponents: filterPagesOrGlobs,
  loadersPathsGlobs,
  root = process.cwd(),
}: AutoExportLoadersOptions): Plugin {
  const filterPaths = createFilter(loadersPathsGlobs)
  const filterPageComponents
    = typeof filterPagesOrGlobs === 'function'
      ? filterPagesOrGlobs
      : createFilter(filterPagesOrGlobs)

  return {
    name: PLUGIN_NAME,
    transform: {
      order: 'post',
      handler(code, id) {
        // strip query to also match .vue?vue&lang=ts etc
        const queryIndex = id.indexOf('?')
        const idWithoutQuery = queryIndex >= 0 ? id.slice(0, queryIndex) : id
        if (!filterPageComponents(idWithoutQuery)) {
          return
        }

        const loadersToExports = extractLoadersToExport(
          code,
          filterPaths,
          root,
        )

        if (loadersToExports.length <= 0)
          return

        const s = new MagicString(code)
        s.append(
          `\nexport const __loaders = [\n${loadersToExports.join(',\n')}\n];\n`,
        )

        return {
          code: s.toString(),
          map: s.generateMap(),
        }
      },
    },
  }
}

export function createAutoExportPlugin(
  options: AutoExportLoadersOptions,
): UnpluginOptions {
  return {
    name: PLUGIN_NAME,
    vite: AutoExportLoaders(options),
  }
}
