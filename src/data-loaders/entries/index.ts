export type {
  DataLoaderContextBase,
  DataLoaderEntryBase,
  // deprecated
  DefineDataLoaderOptionsBase,
  DefineDataLoaderOptionsBase_DefinedData,
  DefineDataLoaderOptionsBase_LaxData,
  DefineLoaderFn,
  UseDataLoader,
  UseDataLoaderInternals,
  UseDataLoaderResult,
} from '../createDataLoader'
export { toLazyValue } from '../createDataLoader'

// expose all symbols that could be used by loaders
export * from '../meta-extensions'
// new data fetching
export {
  DataLoaderPlugin,
  NavigationResult,
  useIsDataLoading,
} from '../navigation-guard'

export type {
  _DataLoaderRedirectResult,
  DataLoaderPluginOptions,
  SetupLoaderGuardOptions,
} from '../navigation-guard'

export type { ErrorDefault, TypesConfig } from '../types-config'

export {
  type _PromiseMerged,
  assign,
  currentContext,
  getCurrentContext,
  isSubsetOf,
  setCurrentContext,
  trackRoute,
  withLoaderContext,
} from '../utils'
