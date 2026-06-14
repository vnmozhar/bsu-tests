/// <reference types="vite/client" />
import type { Question } from '../types'

// Vite picks up every *.json in src/data/ at build time —
// adding a new file there is enough, no code change needed.
const modules = import.meta.glob<Question[]>('../data/*.json', {
  eager: true,
  import: 'default',
})

export interface QuestionSource {
  key: string
  label: string
  count: number
  questions: Question[]
}

function nameFromPath(path: string): string {
  return (path.split('/').pop() ?? path).replace('.json', '')
}

function labelFromName(name: string): string {
  return name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function withSequentialIds(questions: Question[]): Question[] {
  return questions.map((q, i) => ({ ...q, id: i + 1 }))
}

// Sort file entries alphabetically so the order is deterministic
const sortedEntries = Object.entries(modules).sort(([a], [b]) =>
  a.localeCompare(b)
)

const fileSources: QuestionSource[] = sortedEntries.map(([path, qs]) => {
  const name = nameFromPath(path)
  const questions = withSequentialIds(Array.isArray(qs) ? qs : [])
  return {
    key: name,
    label: labelFromName(name),
    count: questions.length,
    questions,
  }
})

const allQuestions = withSequentialIds(
  sortedEntries.flatMap(([, qs]) => (Array.isArray(qs) ? qs : []))
)

export const questionSources: QuestionSource[] = [
  { key: 'all', label: 'All', count: allQuestions.length, questions: allQuestions },
  ...fileSources,
]

export function getSourceByKey(key: string): QuestionSource {
  return questionSources.find((s) => s.key === key) ?? questionSources[0]
}
