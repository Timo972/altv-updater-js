const { build } = require("esbuild")

const external = [
  "yargs",
  "ora",
  "@octokit/core",
  "chalk",
  "fs-jetpack",
  "lodash.isequal",
]

// build the cli part
build({
  entryPoints: ["./src/cli.ts"],
  bundle: true,
  minify: true,
  outfile: "dist/cli.js",
  platform: "node",
  format: "cjs",
  external,
})

build({
  entryPoints: ["./src/lib/index.ts"],
  bundle: true,
  minify: true,
  outfile: "dist/index.js",
  platform: "node",
  format: "cjs",
  external,
})

build({
  entryPoints: ["./src/lib/index.ts"],
  bundle: true,
  minify: true,
  outfile: "dist/index.esm.js",
  platform: "node",
  format: "esm",
  external,
})
