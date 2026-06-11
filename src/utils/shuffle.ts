import type { Question } from '../types'

const LABELS = ['a', 'b', 'c', 'd', 'e', 'f']

export function shuffleOptions(q: Question): Question {
  const entries = Object.entries(q.options).sort(() => Math.random() - 0.5)
  const newOptions: Record<string, string> = {}
  let newCorrectAnswer = ''
  entries.forEach(([originalKey, text], idx) => {
    const label = LABELS[idx]
    newOptions[label] = text
    if (originalKey === q.correct_answer) newCorrectAnswer = label
  })
  return { ...q, options: newOptions, correct_answer: newCorrectAnswer }
}
