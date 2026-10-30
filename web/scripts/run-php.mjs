// Runs a PHP script with the portable PHP in ../.tools (cross-shell friendly).
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
const php = resolve(import.meta.dirname, '../../.tools/php81/php.exe')
const r = spawnSync(php, process.argv.slice(2), { stdio: 'inherit' })
process.exit(r.status ?? 1)
