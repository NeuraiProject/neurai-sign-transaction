import dts from "rollup-plugin-dts";

// The package is CommonJS (no "type": "module"), so TypeScript reads
// dist/index.d.ts as CommonJS: right for `require` (dist/index.cjs), wrong for
// `import` (dist/index.mjs), where it typed the default import as the whole
// module. The same declarations are also written as dist/index.d.mts, which
// TypeScript reads as ESM, for the `import` condition and the browser entry.
export default {
  input: "dist/types/index.d.ts",
  output: [
    { file: "dist/index.d.ts", format: "esm" },
    { file: "dist/index.d.mts", format: "esm" },
  ],
  plugins: [dts()],
};
