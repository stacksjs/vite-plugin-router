# vite-plugin-router

[![NPM version](https://img.shields.io/npm/v/vite-plugin-router?color=black&label=)](https://www.npmjs.com/package/vite-plugin-router) [![ci status](https://github.com/posva/vite-plugin-router/actions/workflows/ci.yml/badge.svg)](https://github.com/posva/vite-plugin-router/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/posva/vite-plugin-router/graph/badge.svg?token=28IvHS7TAx)](https://codecov.io/gh/posva/vite-plugin-router)

> Automatic file based Routing in Vue with TS support ✨

<!-- https://user-images.githubusercontent.com/664177/176622756-3d10acc6-caac-40ff-a41f-9bdccadf7f1d.mp4 -->

<p align="center">
  <img src="https://user-images.githubusercontent.com/664177/176623167-0153f9fb-79cd-49a7-8575-429ce323dd11.gif" >
</p>

- [StackBlitz Demo](https://stackblitz.com/github/posva/uvr-demo)

This build-time plugin simplifies your routing setup **and** makes it safer and easier to use thanks to TypeScript. Requires Vue Router >=4.4.0.

> [!WARNING]
> While vite-plugin-router typed routing and file based routing is fundamentally stable, it contains other experimental APIs that are subject to change (e.g. Data Loaders). Make sure to check the relevant [Documentation](https://uvr.esm.is) for the latest information.
> If you find any issue, design flaw, or have ideas to improve it, please, open open an [issue](https://github.com/posva/vite-plugin-router/issues/new/choose) or a [Discussion](https://github.com/posva/vite-plugin-router/discussions).

## Install

```bash
npm i -D vite-plugin-router
```

Add VueRouter plugin **before** Vue plugin:

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import VueRouter from "vite-plugin-router/vite";

export default defineConfig({
  plugins: [
    VueRouter({
      /* options */
    }),
    // ⚠️ Vue must be placed after VueRouter()
    Vue(),
  ],
});
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import VueRouter from "vite-plugin-router/rollup";

export default {
  plugins: [
    VueRouter({
      /* options */
    }),
    // ⚠️ Vue must be placed after VueRouter()
    Vue(),
  ],
};
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require("vite-plugin-router/webpack")({
      /* options */
    }),
  ],
};
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require("vite-plugin-router/webpack")({
        /* options */
      }),
    ],
  },
};
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from "esbuild";
import VueRouter from "vite-plugin-router/esbuild";

build({
  plugins: [VueRouter()],
});
```

<br></details>

## Setup

After installing, **you should run your dev server** (usually `npm run dev`) **to generate the first version of the types**. Then you need to add the types to your `tsconfig.json`.

```json
{
  "include": [
    // ...
    "./typed-router.d.ts"
  ],
  // ...
  "compilerOptions": {
    // ...
    "moduleResolution": "Bundler"
    // ...
  }
}
```

Then, if you have an `env.d.ts` file like the one created by `npm vue create <my-project>`, add the `vite-plugin-router/client` types to it:

```ts
// env.d.ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-router/client" />
```

If you don't have an `env.d.ts` file, you can create one and add the vite-plugin-router types to it _or_ you can add them to the `types` property in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...
    "types": ["vite-plugin-router/client"]
  }
}
```

Finally, import the generated routes from `vue-router/auto-routes` and pass them to the router:

```diff
import { createRouter, createWebHistory } from 'vue-router'
+import { routes } from 'vue-router/auto-routes'

createRouter({
  history: createWebHistory(),
  // pass the generated routes written by the plugin 🤖
+  routes,
})
```

Alternatively, **you can also import the `routes` array** and create the router manually or pass it to some plugin. Here is an example with [Vitesse starter](https://github.com/antfu-collective/vitesse/blob/main/src/main.ts):

```diff
 import { ViteSSG } from 'vite-ssg'
 import { setupLayouts } from 'virtual:generated-layouts'
 import App from './App.vue'
 import type { UserModule } from './types'
-import generatedRoutes from '~pages'
+import { routes } from 'vue-router/auto-routes'

 import '@unocss/reset/tailwind.css'
 import './styles/main.css'
 import 'uno.css'

-const routes = setupLayouts(generatedRoutes)

 // https://github.com/antfu/vite-ssg
 export const createApp = ViteSSG(
   App,
   {
-   routes,
+   routes: setupLayouts(routes),
    base: import.meta.env.BASE_URL
  },
   (ctx) => {
     // install all modules under `modules/`
     Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
       .forEach(i => i.install?.(ctx))
   },
 )
```

- [📖 Check more in the Documentation](https://uvr.esm.is).

## License

[MIT](http://opensource.org/licenses/MIT)
