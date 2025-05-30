// @ts-nocheck TODO: remove this line when implementing
/**
 * @vitest-environment happy-dom
 */
import type { Ref } from 'vue'
import { enableAutoUnmount } from '@vue/test-utils'
import { expectType } from 'ts-expect'
import {
  NavigationResult,
  setCurrentContext,
} from 'vite-plugin-routes/data-loaders'
import { afterEach, describe } from 'vitest'
import { shallowRef } from 'vue'
import { testDefineLoader } from '../../tests/data-loaders'
import { defineQueryLoader } from '../src/data-loaders/defineQueryLoader'

describe.skip('defineQueryLoader', () => {
  enableAutoUnmount(afterEach)
  testDefineLoader(
    ({ fn, key, ...options }) =>
      defineQueryLoader(fn, {
        ...options,
        queryKey: key ? [key] : ['id'],
      }),
    {
      beforeEach() {
        // invalidate current context
        setCurrentContext(undefined)
      },
      // TODO: query plugin
      // plugins: ({ pinia }) => [pinia],
    },
  )
})

// dts testing
function dts(_fn: () => unknown) {}

// FIXME: move to a test-d.ts file
dts(async () => {
  interface UserData {
    id: string
    name: string
  }

  const useDataLoader = defineQueryLoader(async (route) => {
    const user = {
      id: route.params.id as string,
      name: 'Edu',
    }

    return user
  })

  expectType<{
    data: Ref<UserData>
    error: Ref<unknown>
    isLoading: Ref<boolean>
    refresh: () => Promise<void>
  }>(useDataLoader())

  // TODO: do we really need to support non-async usage?
  const useWithRef = defineQueryLoader(async (route) => {
    const user = shallowRef<UserData>({
      id: route.params.id as string,
      name: 'Edu',
    })

    return user
  })

  expectType<{
    data: Ref<UserData>
    error: Ref<unknown>
    isLoading: Ref<boolean>
    refresh: () => Promise<void>
  }>(useWithRef())

  async function loaderUser() {
    const user: UserData = {
      id: 'one',
      name: 'Edu',
    }

    return user
  }

  expectType<{ data: Ref<UserData | undefined> }>(
    defineQueryLoader(loaderUser, { lazy: true })(),
  )
  expectType<Promise<UserData>>(
    defineQueryLoader(loaderUser, { lazy: true })(),
  )
  expectType<Promise<UserData>>(defineQueryLoader(loaderUser, {})())
  expectType<{ data: Ref<UserData> }>(defineQueryLoader(loaderUser, {})())
  expectType<{ data: Ref<UserData> }>(
    defineQueryLoader(loaderUser, { lazy: false })(),
  )
  expectType<{ data: Ref<UserData> }>(
    defineQueryLoader(loaderUser, { lazy: false })(),
  )

  // it should allow returning a Navigation Result without a type error
  expectType<{ data: Ref<UserData> }>(
    defineQueryLoader(
      async () => {
        if (Math.random()) {
          return loaderUser()
        }
        else {
          return new NavigationResult('/')
        }
      },
      { lazy: false },
    )(),
  )
  expectType<Promise<UserData>>(
    defineQueryLoader(
      async () => {
        if (Math.random()) {
          return loaderUser()
        }
        else {
          return new NavigationResult('/')
        }
      },
      { lazy: false },
    )(),
  )
})
