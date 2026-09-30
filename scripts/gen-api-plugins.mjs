#!/usr/bin/env node
/**
 * Generator plugin REST API untuk bot HABI.
 * Definisi ada di scripts/api-plugins.json.
 * Dipakai sekali untuk membuat plugins/api/ — bukan bagian dari runtime bot.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(here, '..', 'plugins', 'api')
const SPEC = path.join(here, 'api-plugins.json')

const HEADER = [
  '/**',
  ' * ╔══════════════════════════════════════════════╗',
  ' * ║  ------ HABI AI --------                      ║',
  ' * ║  WA Bot • by Habibih Official ID             ║',
  ' * ╚══════════════════════════════════════════════╝',
  ' *',
  ' * @author Habibih Official ID',
  ' * @website habibi-store.pages.dev',
  ' * @wa  wa.me/6285181576338',
  ' * @source Habibih Cloud ID - No Comot, No Ganti Nama',
  ' *',
].join('\n')

/** Helper yang dipakai tiap jenis plugin */
const HELPERS = {
  image: 'sendImage',
  video: 'sendVideo',
  audio: 'sendAudio',
  file: 'sendFile',
  raw: null,
  text: 'sendText',
  status: 'sendText',
}

fs.mkdirSync(OUT, { recursive: true })

const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'))
let made = 0

for (const p of spec) {
  const needs = ['apiFile', 'apiJson']
  const helpers = new Set(['react', 'fail', 'needText', 'needUrl'])

  const primary = HELPERS[p.type]
  if (primary) helpers.add(primary)
  if (p.type === 'text' || p.type === 'status') {
    // ytsearch & ytinfo butuh duration(); yang lain tidak
    if (/duration\(/.test(p.body)) helpers.add('duration')
  }
  if (p.type === 'text' && /bytes\(/.test(p.body)) helpers.add('bytes')
  if (p.needsImage) helpers.add('resolveImageSource')

  const helperImport = [...helpers].sort().join(', ')
  const usesFile = p.body.includes('apiFile(')
  const usesJson = p.body.includes('apiJson(')

  const apiImports = [usesFile && 'apiFile', usesJson && 'apiJson'].filter(Boolean)
  const importLines = [
    `import { ${apiImports.join(', ')} } from '../../lib/habi-api.js'`,
    `import { ${helperImport} } from '../../lib/api-helpers.js'`,
  ].join('\n')

  const body = p.body
    .split('\n')
    .map((line) => (line ? '  ' + line : ''))
    .join('\n')

  const source = `${HEADER} * ${p.desc}
 */

${importLines}

const handler = async (m, { conn }) => {
  try {
${body}
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:${p.cmd})$/i
handler.help = ${JSON.stringify(p.help)}
handler.tags = ${JSON.stringify(p.tags)}
handler.category = '${p.cat}'
handler.description = ${JSON.stringify(p.desc)}

export default handler
`

  fs.writeFileSync(path.join(OUT, p.file), source, 'utf8')
  made++
}

console.log(`  ${made} plugin ditulis ke ${path.relative(process.cwd(), OUT)}`)
