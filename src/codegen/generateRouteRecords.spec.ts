import type { TreeNode } from '../core/tree'
import { basename } from 'pathe'
import { describe, expect, it } from 'vitest'
import { PrefixTree } from '../core/tree'
import { ImportsMap } from '../core/utils'
import { resolveOptions } from '../options'
import { generateRouteRecord } from './generateRouteRecords'

const DEFAULT_OPTIONS = resolveOptions({})

describe('generateRouteRecord', () => {
  function generateRouteRecordSimple(tree: TreeNode) {
    return generateRouteRecord(
      tree,
      {
        ...DEFAULT_OPTIONS,
        ...tree.options,
      },
      new ImportsMap(),
    )
  }

  it('works with an empty tree', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)

    expect(generateRouteRecordSimple(tree)).toMatchInlineSnapshot(`
      "[

      ]"
    `)
  })

  it('works with some paths at root', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('a', 'a.vue')
    tree.insert('b', 'b.vue')
    tree.insert('c', 'c.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('handles multiple named views', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('foo', 'foo.vue')
    tree.insert('foo@a', 'foo@a.vue')
    tree.insert('foo@b', 'foo@b.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('handles single named views', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('foo@a', 'foo@a.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('nested children', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('a/a', 'a/a.vue')
    tree.insert('a/b', 'a/b.vue')
    tree.insert('a/c', 'a/c.vue')
    tree.insert('b/b', 'b/b.vue')
    tree.insert('b/c', 'b/c.vue')
    tree.insert('b/d', 'b/d.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    tree.insert('c', 'c.vue')
    tree.insert('d', 'd.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('adds children and name when folder and component exist', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('a/c', 'a/c.vue')
    tree.insert('b/c', 'b/c.vue')
    tree.insert('a', 'a.vue')
    tree.insert('d', 'd.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('correctly names index files', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('index', 'index.vue')
    tree.insert('b/index', 'b/index.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('handles non nested routes', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('users', 'users.vue')
    tree.insert('users/index', 'users/index.vue')
    tree.insert('users/other', 'users/other.vue')
    tree.insert('users.not-nested', 'users.not-nested.vue')
    tree.insert('users/[id]/index', 'users/[id]/index.vue')
    tree.insert('users/[id]/other', 'users/[id]/other.vue')
    tree.insert('users/[id]', 'users/[id].vue')
    tree.insert('users/[id].not-nested', 'users/[id].not-nested.vue')
    tree.insert('users.[id].also-not-nested', 'users.[id].also-not-nested.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('removes trailing slashes', () => {
    const tree = new PrefixTree(DEFAULT_OPTIONS)
    tree.insert('users/index', 'users/index.vue')
    tree.insert('users/other', 'users/other.vue')
    tree.insert('nested', 'nested.vue')
    tree.insert('nested/index', 'nested/index.vue')
    tree.insert('nested/other', 'nested/other.vue')
    expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
  })

  it('generate static imports', () => {
    const options = resolveOptions({
      ...DEFAULT_OPTIONS,
      importMode: 'sync',
    })
    const tree = new PrefixTree(options)
    tree.insert('a', 'a.vue')
    tree.insert('b', 'b.vue')
    tree.insert('nested/file/c', 'nested/file/c.vue')
    const importList = new ImportsMap()
    expect(generateRouteRecord(tree, options, importList)).toMatchSnapshot()

    expect(importList.toString()).toMatchSnapshot()
  })

  it('generate custom imports', () => {
    const options = resolveOptions({
      importMode: filepath =>
        basename(filepath) === 'a.vue' ? 'sync' : 'async',
    })

    const tree = new PrefixTree(options)
    tree.insert('a', 'a.vue')
    tree.insert('b', 'b.vue')
    tree.insert('nested/file/c', 'nested/file/c.vue')
    const importList = new ImportsMap()
    expect(generateRouteRecord(tree, options, importList)).toMatchSnapshot()

    expect(importList.toString()).toMatchSnapshot()
  })

  describe('names', () => {
    it('creates single word names', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      tree.insert('index', 'index.vue')
      tree.insert('about', 'about.vue')
      tree.insert('users/index', 'users/index.vue')
      tree.insert('users/[id]', 'users/[id].vue')
      tree.insert('users/[id]/edit', 'users/[id]/edit.vue')
      tree.insert('users/new', 'users/new.vue')

      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('creates multi word names', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      tree.insert('index', 'index.vue')
      tree.insert('my-users', 'my-users.vue')
      tree.insert('MyPascalCaseUsers', 'MyPascalCaseUsers.vue')
      tree.insert(
        'some-nested/file-with-[id]-in-the-middle',
        'some-nested/file-with-[id]-in-the-middle.vue',
      )

      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('works with nested views', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      tree.insert('index', 'index.vue')
      tree.insert('users', 'users.vue')
      tree.insert('users/index', 'users/index.vue')
      tree.insert('users/[id]/edit', 'users/[id]/edit.vue')
      tree.insert('users/[id]', 'users/[id].vue')

      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })
  })

  describe('route block', () => {
    it('adds meta data', async () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      const node = tree.insert('index', 'index.vue')
      node.setCustomRouteBlock('index', {
        meta: {
          auth: true,
          title: 'Home',
        },
      })

      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('merges multiple meta properties', async () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      const node = tree.insert('index', 'index.vue')
      node.setCustomRouteBlock('index', {
        path: '/custom',
        meta: {
          one: true,
        },
      })
      node.setCustomRouteBlock('index@named', {
        name: 'hello',
        meta: {
          two: true,
        },
      })

      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('merges regardless of order', async () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      const node = tree.insert('index', 'index.vue')
      node.setCustomRouteBlock('index', {
        name: 'a',
      })
      node.setCustomRouteBlock('index@named', {
        name: 'b',
      })

      const one = generateRouteRecordSimple(tree)

      node.setCustomRouteBlock('index@named', {
        name: 'b',
      })
      node.setCustomRouteBlock('index', {
        name: 'a',
      })

      expect(generateRouteRecordSimple(tree)).toBe(one)

      expect(one).toMatchSnapshot()
    })

    it('handles named views with empty route blocks', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      const node = tree.insert('index', 'index.vue')
      const n2 = tree.insert('index@named', 'index@named.vue')
      expect(node).toBe(n2)
      // coming from index
      node.setCustomRouteBlock('index', {
        meta: {
          auth: true,
          title: 'Home',
        },
      })
      // coming from index@named (no route block)
      node.setCustomRouteBlock('index@named', undefined)

      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    // FIXME: allow aliases
    it.todo('merges alias properties', async () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      const node = tree.insert('index', 'index.vue')
      node.setCustomRouteBlock('index', {
        alias: '/one',
      })
      node.setCustomRouteBlock('index@named', {
        alias: ['/two', '/three'],
      })

      expect(generateRouteRecordSimple(tree)).toMatchInlineSnapshot(`
        "[
          {
            path: '/',
            name: '/',
            component: () => import('index'),
            /* no props */
            /* no children */
          }
        ]"
      `)
    })

    it('merges deep meta properties', async () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      const node = tree.insert('index', 'index.vue')
      node.setCustomRouteBlock('index', {
        meta: {
          a: { one: 1 },
          b: { a: [2] },
        },
      })
      node.setCustomRouteBlock('index@named', {
        meta: {
          a: { two: 1 },
          b: { a: [3] },
        },
      })

      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })
  })

  describe('raw paths insertions', () => {
    it('works with raw paths', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      tree.insertParsedPath('a', 'a.vue')
      tree.insertParsedPath('b', 'b.vue')
      tree.insertParsedPath('c', 'c.vue')
      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('works with mixed nodes', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      tree.insertParsedPath('a', 'a.vue')
      tree.insert('b', 'b.vue')
      tree.insertParsedPath('c', 'c.vue')
      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('works with nested nodes', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      tree.insertParsedPath('a/b/c', 'a.vue')
      tree.insertParsedPath('a/b/d', 'a.vue')
      tree.insertParsedPath('a/d/c', 'a.vue')
      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('do not nest raw segments with file based', () => {
      const tree = new PrefixTree(DEFAULT_OPTIONS)
      tree.insert('a/b', 'a/b.vue')
      // should be separated
      tree.insertParsedPath('a/b/c', 'a.vue')
      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })

    it('dedupes sync imports for the same component', () => {
      const tree = new PrefixTree(
        resolveOptions({
          importMode: 'sync',
        }),
      )

      tree.insertParsedPath('a/b', 'a.vue')
      tree.insertParsedPath('a/c', 'a.vue')

      // what matters is that the import name is reused _page_0
      expect(generateRouteRecordSimple(tree)).toMatchSnapshot()
    })
  })
})
