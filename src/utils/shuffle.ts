import type { Question } from '../types'

const LABELS = ['a', 'b', 'c', 'd', 'e', 'f']

export function shuffleOptions(q: Question): Question {
  const entries = Object.entries(q.options).sort(() => Math.random() - 0.5)
  const newOptions: Record<string, string> = {}
  const keyMap: Record<string, string> = {}
  entries.forEach(([originalKey, text], idx) => {
    const label = LABELS[idx]
    newOptions[label] = text
    keyMap[originalKey] = label
  })
  const newCorrectAnswer = Array.isArray(q.correct_answer)
    ? q.correct_answer.map((k) => keyMap[k])
    : keyMap[q.correct_answer]
  return { ...q, options: newOptions, correct_answer: newCorrectAnswer }
}
