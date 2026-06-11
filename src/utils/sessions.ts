const STORAGE_KEY = 'quiz_app_sessions'

export interface LearnSession {
  id: string
  type: 'learn'
  startTime: number
  endTime?: number
  duration?: number // seconds
}

export interface QuizSession {
  id: string
  type: 'quiz'
  startTime: number
  endTime?: number
  duration?: number // seconds
  setup: {
    questionCount: number
    feedbackMode: 'live' | 'end'
  }
  result?: {
    correct: number
    total: number
    percent: number
  }
}

export type Session = LearnSession | QuizSession

export function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session[]) : []
  } catch {
    return []
  }
}

function save(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function startLearnSession(): string {
  const id = `learn_${Date.now()}`
  const sessions = getSessions()
  sessions.push({ id, type: 'learn', startTime: Date.now() })
  save(sessions)
  return id
}

export function endLearnSession(id: string) {
  const sessions = getSessions()
  const s = sessions.find((x) => x.id === id) as LearnSession | undefined
  if (!s) return
  s.endTime = Date.now()
  s.duration = Math.round((s.endTime - s.startTime) / 1000)
  save(sessions)
}

export function startQuizSession(setup: QuizSession['setup']): string {
  const id = `quiz_${Date.now()}`
  const sessions = getSessions()
  sessions.push({ id, type: 'quiz', startTime: Date.now(), setup })
  save(sessions)
  return id
}

export function endQuizSession(id: string, result?: QuizSession['result']) {
  const sessions = getSessions()
  const s = sessions.find((x) => x.id === id) as QuizSession | undefined
  if (!s) return
  s.endTime = Date.now()
  s.duration = Math.round((s.endTime - s.startTime) / 1000)
  if (result) s.result = result
  save(sessions)
}

export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const sec = seconds % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString()
}

export function toLogText(sessions: Session[]): string {
  if (sessions.length === 0) return 'No sessions recorded.\n'
  return (
    sessions
      .map((s) => {
        const date = new Date(s.startTime).toISOString().replace('T', ' ').slice(0, 19)
        if (s.type === 'learn') {
          return `${date} | LEARN | duration: ${formatDuration(s.duration)}`
        }
        const q = s as QuizSession
        const score = q.result
          ? `score: ${q.result.correct}/${q.result.total} (${q.result.percent}%)`
          : 'abandoned'
        return `${date} | QUIZ | questions: ${q.setup.questionCount} | mode: ${q.setup.feedbackMode} | ${score} | duration: ${formatDuration(q.duration)}`
      })
      .join('\n') + '\n'
  )
}

export function downloadLog(sessions: Session[]) {
  const content = toLogText(sessions)
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sessions.log'
  a.click()
  URL.revokeObjectURL(url)
}
