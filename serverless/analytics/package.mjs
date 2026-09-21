import { mkdir, copyFile, readdir, cp } from 'node:fs/promises'
const output = new URL('./build/function/', import.meta.url)
await mkdir(output, { recursive: true })
const files = ["handler.mjs", "validation.mjs", "store.mjs", "runtime.mjs"]
for (const name of await readdir(output)) {
  if (!files.includes(name) && name !== 'node_modules') throw new Error(`Unexpected deployment file: ${name}. Inspect the build directory before deploying.`)
}
for (const file of files) {
  await copyFile(new URL(file, import.meta.url), new URL(file, output))
}
console.log('Lambda source prepared in build/function (no environment files).')

await cp(new URL('./node_modules/', import.meta.url), new URL('node_modules/', output), {recursive:true})
