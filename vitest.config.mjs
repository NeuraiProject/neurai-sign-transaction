import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test.js", "test-regtest.js", "test-txhash.test.ts", "test-sighash.js"],
    environment: "node",
    globals: true,
  },
});
