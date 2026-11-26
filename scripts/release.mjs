#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = process.cwd()
const registry = 'https://registry.npmjs.org/'
const pkgPath = resolve(root, 'package.json')
const docsPath = resolve(root, 'src/playground/docs/UsageDocs.vue')
const indexHtmlPath = resolve(root, 'index.html')
const changelogPath = resolve(root, 'CHANGELOG.md')
const sitemapPath = resolve(root, 'public/sitemap.xml')

const args = process.argv.slice(2)
if (args.includes('--help')) {
  console.log(`Usage:
  pnpm release [patch|minor|major|x.y.z] [notes]

Examples:
  pnpm release patch "Fix keyboard focus in collapsed details"
  pnpm release minor
  pnpm release 0.2.0 "First stable minor release"

The command updates version references, runs checks, commits, tags, publishes to npm,
pushes the commit and tag, and creates the GitHub release.
`)
  process.exit(0)
}

const dryRun = args.includes('--dry-run')
const positional = args.filter((arg) => !arg.startsWith('--'))
const bump = positional[0] && /^(patch|minor|major|\d+\.\d+\.\d+)$/.test(positional[0])
  ? positional[0]
  : 'patch'
const notes = positional.slice(positional[0] === bump ? 1 : 0).join(' ').trim()

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
    ...options,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim() || ''
    throw new Error(`${command} ${commandArgs.join(' ')} failed${detail ? `: ${detail}` : ''}`)
  }
  return result.stdout?.trim() ?? ''
}

function capture(command, commandArgs) {
  return run(command, commandArgs, { capture: true })
}

function fail(message) {
  console.error(`\nrelease: ${message}\n`)
  process.exit(1)
}

function bumpVersion(version, type) {
  if (/^\d+\.\d+\.\d+$/.test(type)) return type
  const parts = version.split('.').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Unsupported current version: ${version}`)
  }
  const [major, minor, patch] = parts
  if (type === 'major') return `${major + 1}.0.0`
  if (type === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

function versionExists(version) {
  const result = spawnSync(
    'npm',
    ['view', `@simon_he/timeline-ui@${version}`, 'version', '--registry', registry],
    { cwd: root, stdio: 'ignore', encoding: 'utf8' },
  )
  return result.status === 0
}

function stagedVersion(version) {
  try {
    const stages = JSON.parse(capture('npm', ['stage', 'list', '--json', '--registry', registry]))
    return stages.find(
      (stage) => stage.packageName === '@simon_he/timeline-ui' && stage.version === version,
    )
  } catch {
    return undefined
  }
}

async function waitForVersion(version) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (versionExists(version)) return true
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  return false
}

function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const currentVersion = pkg.version
const nextVersion = bumpVersion(currentVersion, bump)
const releaseDate = today()
const releaseNotes = notes || `Release ${nextVersion}.`

if (capture('git', ['status', '--porcelain'])) {
  fail('working tree is not clean. Commit or stash changes before releasing.')
}
if (capture('git', ['symbolic-ref', '--short', 'HEAD']) !== 'main') {
  fail('release must run from the main branch.')
}
try {
  const user = capture('npm', ['whoami', '--registry', registry])
  console.log(`release: npm user is ${user}`)
} catch {
  fail(`npm is not authenticated for ${registry}. Run npm login --registry=${registry} first.`)
}
if (!versionExists(currentVersion)) {
  fail(`current version ${currentVersion} is not published. Approve or publish it before creating a new version.`)
}
if (versionExists(nextVersion)) {
  fail(`version ${nextVersion} is already published.`)
}

console.log(`\nrelease: ${currentVersion} -> ${nextVersion}`)
console.log(`notes: ${releaseNotes}\n`)
if (dryRun) {
  console.log('dry run: no files or git refs were changed.')
  process.exit(0)
}

const backups = new Map()
function backup(path) {
  if (!backups.has(path)) backups.set(path, readFileSync(path, 'utf8'))
}
function restore() {
  for (const [path, content] of backups) writeFileSync(path, content)
}

try {
  backup(pkgPath)
  pkg.version = nextVersion
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  backup(docsPath)
  const docs = readFileSync(docsPath, 'utf8')
  const nextDocs = docs.replace(/<span>v\d+\.\d+\.\d+<\/span>/, `<span>v${nextVersion}</span>`)
  if (nextDocs === docs) throw new Error('could not find the Docs version label')
  writeFileSync(docsPath, nextDocs)

  backup(indexHtmlPath)
  const html = readFileSync(indexHtmlPath, 'utf8')
  const nextHtml = html.replace(/"softwareVersion": "\d+\.\d+\.\d+"/, `"softwareVersion": "${nextVersion}"`)
  if (nextHtml === html) throw new Error('could not find the JSON-LD softwareVersion')
  writeFileSync(indexHtmlPath, nextHtml)

  backup(sitemapPath)
  const sitemap = readFileSync(sitemapPath, 'utf8')
  writeFileSync(sitemapPath, sitemap.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${releaseDate}</lastmod>`))

  backup(changelogPath)
  let changelog = readFileSync(changelogPath, 'utf8')
  const entry = `## [${nextVersion}] - ${releaseDate}\n\n${releaseNotes}\n\n`
  changelog = changelog.replace(/^## \[/m, `${entry}## [`)
  const link = `[${nextVersion}]: https://www.npmjs.com/package/@simon_he/timeline-ui/v/${nextVersion}`
  if (!changelog.includes(link)) {
    const previousLinks = changelog.match(/^\[\d+\.\d+\.\d+\]:.*$/gm) || []
    const newLinks = [link, ...previousLinks].join('\n')
    changelog = changelog.replace(previousLinks.join('\n'), newLinks)
  }
  writeFileSync(changelogPath, changelog)

  console.log('\nrelease: running checks')
  run('pnpm', ['typecheck'])
  run('pnpm', ['test'])
  run('pnpm', ['build'])
  run('pnpm', ['build:demo'])
} catch (error) {
  restore()
  fail(error instanceof Error ? error.message : String(error))
}

console.log('\nrelease: committing version files')
run('git', ['add', 'package.json', 'CHANGELOG.md', 'src/playground/docs/UsageDocs.vue', 'index.html', 'public/sitemap.xml'])
run('git', ['commit', '-m', `release: v${nextVersion}`])
run('git', ['tag', `v${nextVersion}`])

try {
  console.log('\nrelease: publishing to npm (2FA may be required)')
  run('npm', ['publish', '--access', 'public', '--registry', registry, '--ignore-scripts'])
} catch (error) {
  console.error('\nrelease: npm publish failed. The local commit and tag were kept.')
  console.error(`Check the error above, then retry with:
  npm publish --access public --registry=${registry} --ignore-scripts
  git push origin main
  git push origin v${nextVersion}
`)
  process.exit(1)
}

if (!(await waitForVersion(nextVersion))) {
  const stage = stagedVersion(nextVersion)
  console.error(`\nrelease: npm accepted the upload but ${nextVersion} is not publicly visible.`)
  console.error('release: the package may be waiting for staged publishing approval.')
  if (stage) {
    console.error(`Approve it with:
  npm stage approve ${stage.id} --registry=${registry}
`)
  } else {
    console.error(`Approve it from https://www.npmjs.com/package/@simon_he/timeline-ui, then verify:
  npm view @simon_he/timeline-ui@${nextVersion} version --registry=${registry}
`)
  }
  console.error(`After approval, push and create the release:
  git push origin main
  git push origin v${nextVersion}
  gh release create v${nextVersion} --title "Timeline UI v${nextVersion}" --notes "${releaseNotes}"
`)
  process.exit(1)
}

console.log('\nrelease: pushing commit and tag')
run('git', ['push', 'origin', 'main'])
run('git', ['push', 'origin', `v${nextVersion}`])

try {
  console.log('\nrelease: creating GitHub release')
  run('gh', ['release', 'create', `v${nextVersion}`, '--title', `Timeline UI v${nextVersion}`, '--notes', releaseNotes])
} catch {
  console.error('\nrelease: npm and git are complete, but the GitHub release was not created.')
  console.error(`Run: gh release create v${nextVersion} --title "Timeline UI v${nextVersion}" --notes "${releaseNotes}"`)
}

console.log(`\nrelease: @simon_he/timeline-ui@${nextVersion} complete`)
console.log(`https://www.npmjs.com/package/@simon_he/timeline-ui`)
console.log(`https://github.com/Simon-He95/timeline-ui/releases/tag/v${nextVersion}`)
