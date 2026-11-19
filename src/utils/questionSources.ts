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

export interface QuestionSourceOption {
  value: string
  title: string
  children?: QuestionSourceOption[]
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

interface FileQuestionSource {
  key: string
  label: string
  questions: Question[]
}

const filesBySubject = new Map<string, FileQuestionSource[]>()
for (const [path, qs] of sortedEntries) {
  const name = nameFromPath(path)
  const separatorIndex = name.indexOf('__')
  const subject = separatorIndex === -1 ? name : name.slice(0, separatorIndex)
  const topic = separatorIndex === -1 ? name : name.slice(separatorIndex + 2)
  const subjectFiles = filesBySubject.get(subject) ?? []
  subjectFiles.push({
    key: `file:${name}`,
    label: labelFromName(topic),
    questions: Array.isArray(qs) ? qs : [],
  })
  filesBySubject.set(subject, subjectFiles)
}

const sourcesBySubject = Array.from(filesBySubject, ([subject, files]) => {
  const subjectQuestions = withSequentialIds(files.flatMap((file) => file.questions))
  const subjectSource: QuestionSource = {
    key: `subject:${subject}`,
    label: labelFromName(subject),
    count: subjectQuestions.length,
    questions: subjectQuestions,
  }
  const individualSources = files.map((file) => {
    const questions = withSequentialIds(file.questions)
    return {
      key: file.key,
      label: file.label,
      count: questions.length,
      questions,
    }
  })

  return {
    subjectSource,
    individualSources,
  }
})

const allQuestions = withSequentialIds(
  sortedEntries.flatMap(([, qs]) => (Array.isArray(qs) ? qs : []))
)

export const questionSources: QuestionSource[] = [
  { key: 'all', label: 'Все вопросы', count: allQuestions.length, questions: allQuestions },
  ...sourcesBySubject.map(({ subjectSource }) => subjectSource),
  ...sourcesBySubject.flatMap(({ individualSources }) => individualSources),
]

export const questionSourceOptions: QuestionSourceOption[] = [
  { value: 'all', title: `Все вопросы (${allQuestions.length})` },
  ...sourcesBySubject.map(({ subjectSource, individualSources }) => {
    return {
      value: subjectSource.key,
      title: `${subjectSource.label} — все темы (${subjectSource.count})`,
      children: individualSources.map((source) => ({
        value: source.key,
        title: `${source.label} (${source.count})`,
      })),
    }
  }),
]

export function getSourceByKey(key: string): QuestionSource {
  return questionSources.find((s) => s.key === key) ?? questionSources[0]
}
