import commonjs from "@rollup/plugin-commonjs";
import inject from "@rollup/plugin-inject";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

const extensions = [".ts", ".js"];

const basePlugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
    extensions,
  }),
  commonjs(),
  inject({
    Buffer: ["buffer", "Buffer"],
  }),
  replace({
    preventAssignment: true,
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
  }),
  typescript({
    tsconfig: "./tsconfig.build.json",
  }),
];

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.mjs",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/index.cjs",
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: basePlugins,
  },
  {
    input: "src/browser.ts",
    output: {
      file: "dist/browser.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: basePlugins,
  },
  {
    input: "src/global.ts",
    output: {
      file: "dist/NeuraiSignTransaction.global.js",
      format: "iife",
      name: "NeuraiSignTransactionBundle",
      sourcemap: true,
    },
    plugins: basePlugins,
  },
];
