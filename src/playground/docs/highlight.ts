import { DOC_TYPES } from './type-docs'

export type CodeLanguage = 'ts' | 'vue' | 'shell'

export type CodeTokenKind =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'type'
  | 'tag'
  | 'attr'
  | 'builtin'
  | 'function'
  | 'punct'

export interface CodeToken {
  text: string
  kind: CodeTokenKind
  typeName?: string
}

const KEYWORDS = new Set([
  'abstract',
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'keyof',
  'let',
  'namespace',
  'new',
  'of',
  'private',
  'protected',
  'public',
  'readonly',
  'return',
  'satisfies',
  'static',
  'switch',
  'throw',
  'try',
  'type',
  'typeof',
  'var',
  'while',
  'yield',
])

const CONSTANTS = new Set(['true', 'false', 'null', 'undefined'])

const BUILTIN_TYPES = new Set([
  'any',
  'bigint',
  'boolean',
  'Component',
  'Exclude',
  'Extract',
  'Map',
  'never',
  'NonNullable',
  'number',
  'object',
  'Omit',
  'Partial',
  'Pick',
  'Promise',
  'Readonly',
  'Record',
  'Required',
  'ReturnType',
  'Set',
  'string',
  'symbol',
  'unknown',
  'void',
])

const SHELL_COMMANDS = new Set(['pnpm', 'npm', 'npx', 'yarn', 'bun'])

const TYPE_NAMES = new Set(Object.keys(DOC_TYPES))

function pushToken(
  tokens: CodeToken[],
  text: string,
  kind: CodeTokenKind,
  typeName?: string,
): void {
  if (!text) return
  const last = tokens[tokens.length - 1]
  if (
    last &&
    last.kind === kind &&
    !last.typeName &&
    !typeName &&
    (kind === 'plain' || kind === 'punct' || kind === 'comment')
  ) {
    last.text += text
    return
  }
  tokens.push(typeName ? { text, kind, typeName } : { text, kind })
}

function wordEnd(code: string, start: number, tagMode = false): number {
  let end = start
  while (end < code.length) {
    const char = code[end]
    if (tagMode ? !/[A-Za-z0-9_$:-]/.test(char) : !/[A-Za-z0-9_$]/.test(char)) break
    end += 1
  }
  return end
}

function stringEnd(code: string, start: number): number {
  const quote = code[start]
  let end = start + 1
  while (end < code.length) {
    if (code[end] === '\\') {
      end += 2
      continue
    }
    if (code[end] === quote) return end + 1
    end += 1
  }
  return end
}

function classifyWord(
  code: string,
  end: number,
  token: string,
): { kind: CodeTokenKind; typeName?: string } {
  if (TYPE_NAMES.has(token)) return { kind: 'type', typeName: token }
  if (KEYWORDS.has(token)) return { kind: 'keyword' }
  if (CONSTANTS.has(token)) return { kind: 'builtin' }
  if (BUILTIN_TYPES.has(token)) return { kind: 'builtin' }

  let next = end
  while (next < code.length && /\s/.test(code[next])) next += 1
  if (code[next] === '(') return { kind: 'function' }
  if (code[next] === ':') return { kind: 'attr' }
  if (code[next] === '?' && code[next + 1] === ':') return { kind: 'attr' }

  return { kind: 'plain' }
}

export function tokenizeCode(code: string, language: CodeLanguage = 'ts'): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0
  let inTag = false
  let tagNamePending = false
  let lineStart = true

  while (index < code.length) {
    const char = code[index]

    if (/\s/.test(char)) {
      let end = index
      while (end < code.length && /\s/.test(code[end])) end += 1
      pushToken(tokens, code.slice(index, end), 'plain')
      if (code.slice(index, end).includes('\n')) lineStart = true
      index = end
      continue
    }

    if (language === 'shell' && char === '#') {
      let end = index
      while (end < code.length && code[end] !== '\n') end += 1
      pushToken(tokens, code.slice(index, end), 'comment')
      index = end
      continue
    }

    if (char === '/' && code[index + 1] === '/') {
      let end = index
      while (end < code.length && code[end] !== '\n') end += 1
      pushToken(tokens, code.slice(index, end), 'comment')
      index = end
      continue
    }

    if (char === '/' && code[index + 1] === '*') {
      const end = code.indexOf('*/', index + 2)
      const stop = end === -1 ? code.length : end + 2
      pushToken(tokens, code.slice(index, stop), 'comment')
      index = stop
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      const end = stringEnd(code, index)
      pushToken(tokens, code.slice(index, end), 'string')
      index = end
      continue
    }

    if (language === 'vue' && inTag) {
      if (char === '>') {
        pushToken(tokens, char, 'punct')
        inTag = false
        tagNamePending = false
        index += 1
        continue
      }
      if (char === '/' && code[index + 1] === '>') {
        pushToken(tokens, '/>', 'punct')
        inTag = false
        tagNamePending = false
        index += 2
        continue
      }
      if (char === '/' || char === '=') {
        pushToken(tokens, char, 'punct')
        index += 1
        continue
      }
      if (char === '@' || char === '#' || char === ':') {
        const end = wordEnd(code, index + 1, true)
        pushToken(tokens, code.slice(index, end), 'attr')
        index = end
        tagNamePending = false
        continue
      }
      if (/[A-Za-z_$]/.test(char)) {
        const end = wordEnd(code, index, true)
        pushToken(tokens, code.slice(index, end), tagNamePending ? 'tag' : 'attr')
        tagNamePending = false
        index = end
        continue
      }
    }

    if (
      language === 'vue' &&
      !inTag &&
      char === '<' &&
      /[A-Za-z/!]/.test(code[index + 1] ?? '') &&
      (code[index + 1] === '/' || !/[A-Za-z0-9_$)\]]/.test(code[index - 1] ?? ''))
    ) {
      inTag = true
      tagNamePending = true
      pushToken(tokens, '<', 'punct')
      index += 1
      if (code[index] === '/') {
        pushToken(tokens, '/', 'punct')
        index += 1
      }
      continue
    }

    if (/[A-Za-z_$]/.test(char)) {
      const end = wordEnd(code, index)
      const word = code.slice(index, end)
      if (language === 'shell' && lineStart && SHELL_COMMANDS.has(word)) {
        pushToken(tokens, word, 'function')
      } else {
        const classified = classifyWord(code, end, word)
        pushToken(tokens, word, classified.kind, classified.typeName)
      }
      lineStart = false
      index = end
      continue
    }

    if (/[0-9]/.test(char)) {
      let end = index
      while (end < code.length && /[0-9._]/.test(code[end])) end += 1
      pushToken(tokens, code.slice(index, end), 'number')
      lineStart = false
      index = end
      continue
    }

    pushToken(tokens, char, 'punct')
    lineStart = false
    index += 1
  }

  return tokens
}
