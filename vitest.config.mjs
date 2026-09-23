import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test.js", "test-regtest.js"],
    environment: "node",
    globals: true,
  },
});
