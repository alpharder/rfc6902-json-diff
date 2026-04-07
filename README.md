# rfc6902-json-diff

The fastest RFC 6902 JSON Patch diff generator. With move detection. With intelligent array diffing. Zero dependencies.

```typescript
import { compare } from "rfc6902-json-diff";

const patch = compare(
  { name: "Alice", items: [1, 2, 3] },
  { name: "Bob",   items: [1, 3, 4] }
);
// [
//   { op: "replace", path: "/name", value: "Bob" },
//   { op: "replace", path: "/items/1", value: 3 },
//   { op: "replace", path: "/items/2", value: 4 }
// ]
```

## Why this library?

There are plenty of JSON diff libraries. None of them combine all three: RFC 6902 compliance, move detection, and LCS-based array diffing.

| | RFC 6902 output | Move detection | LCS array diff | Zero deps | gzip |
|---|:---:|:---:|:---:|:---:|:---:|
| **rfc6902-json-diff** | **Yes** | **Yes** | **Yes** | **Yes** | **~2.5 KB** |
| fast-json-patch | Yes | No | No | Yes | ~4 KB |
| jsondiffpatch | Via formatter\* | Yes\* | Yes | No | ~5.2 KB |
| rfc6902 | Yes | No | No | Yes | ~2.7 KB |
| just-diff | Partial | No | No | Yes | ~0.8 KB |
| microdiff | No | No | No | Yes | ~0.5 KB |

\* jsondiffpatch detects moves internally, but its RFC 6902 formatter flattens them back into add/remove pairs. The move information is lost.

## Install

```bash
npm install rfc6902-json-diff
```

Works with yarn, pnpm, bun, and any npm-compatible package manager. Compatible with Node.js, Bun, Deno, and browsers via bundlers (ships ESM + CJS).

## Usage

### Basic diff

```typescript
import { compare } from "rfc6902-json-diff";

const patch = compare(oldDocument, newDocument);
// Returns RFC 6902 operations: add, remove, replace
```

### Move detection

When array elements are reordered, detect moves instead of generating redundant remove + add pairs:

```typescript
const left  = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
const right = [{ id: 4 }, { id: 1 }, { id: 2 }, { id: 3 }];

compare(left, right, { detectMoveOperations: true });
// [{ op: "move", from: "/3", path: "/0" }]
```

### Applying patches

This library focuses on diff generation only. To apply patches, use [fast-json-patch](https://www.npmjs.com/package/fast-json-patch):

```typescript
import { compare } from "rfc6902-json-diff";
import { applyPatch } from "fast-json-patch";

const patch = compare(oldDoc, newDoc);
const { newDocument } = applyPatch(oldDoc, patch);
```

## API

### `compare(left, right, options?)`

Returns an array of [RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902) operations that transform `left` into `right`.

| Parameter | Type | Description |
|---|---|---|
| `left` | `object \| array` | Source value |
| `right` | `object \| array` | Target value |
| `options.detectMoveOperations` | `boolean` | Detect array element moves (default: `false`) |
| `options.doCaching` | `boolean` | Cache deep equality results (default: `false`) |

**Generated operations:** `add`, `remove`, `replace`, `move` (when enabled).

`copy` and `test` operations are not generated.

## Performance

Benchmarked against all RFC 6902-capable libraries on real-world JSON documents.

| Test case | rfc6902-json-diff | fast-json-patch | rfc6902 | jsondiffpatch |
|---|---:|---:|---:|---:|
| Large doc, few changes | **1,080** | 470 | 126 | 42 |
| Large doc, structural changes | **720** | 460 | 4 | 59 |
| Array replacement | **400,000** | 4,600 | 500 | 2,600 |
| Identical small docs | **48,000,000** | 10,500,000 | 2,500,000 | 3,800,000 |
| Array additions | **370,000** | 61,000 | 4,000 | 40,000 |

*Operations per second, higher is better. Apple M1, macOS 26.3, Bun 1.3.11. [Benchmark source](./benchmark/benchmark.ts).*

### How it's fast

- **Myers diff algorithm** for arrays via LCS, not naive index-by-index comparison
- **Early termination** on reference equality (`===`) skips unchanged subtrees
- **Zero intermediate allocations** in the diff iterator hot path
- **No frameworks, plugins, or formatters** — just the diff

## Spec compliance

- Full [RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902) (JSON Patch) output
- Correct [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901) (JSON Pointer) path escaping (`~` -> `~0`, `/` -> `~1`)

## When to use this

- **Real-time collaboration** — compute deltas between document states
- **State management** — undo/redo, time-travel debugging, cross-tab sync
- **API auditing** — track changes between API responses at scale
- **Config diffing** — minimal changesets for infrastructure-as-code

## Contributing

```bash
git clone https://github.com/nicedude/rfc6902-json-diff
cd rfc6902-json-diff
bun install
bun run build
bun run test           # 260 test cases
cd benchmark && bun benchmark.ts  # run benchmarks
```

PRs welcome. Please ensure all tests pass before submitting.

## License

MIT
