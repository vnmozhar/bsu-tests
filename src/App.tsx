import { useState, useRef } from 'react'
import { ConfigProvider } from 'antd'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'
import type { Question, FeedbackMode } from './types'
import questionsData from './data/questions.json'
import {
  startLearnSession,
  endLearnSession,
  startQuizSession,
  endQuizSession,
} from './utils/sessions'

const allQuestions = questionsData as Question[]

type View = 'home' | 'learn' | 'setup' | 'quiz' | 'results'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [questions, setQuestions] = useState<Question[]>([])
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('end')
  const [finalAnswers, setFinalAnswers] = useState<Record<number, string>>({})
  const sessionId = useRef<string | null>(null)

  const goHome = () => {
    // End any active session
    if (sessionId.current) {
      if (view === 'learn') endLearnSession(sessionId.current)
      else if (view === 'quiz') endQuizSession(sessionId.current) // abandoned
      sessionId.current = null
    }
    setView('home')
  }

  const handleSelectLearn = () => {
    sessionId.current = startLearnSession()
    setView('learn')
  }

  const handleStart = (count: number, mode: FeedbackMode) => {
    sessionId.current = startQuizSession({ questionCount: count, feedbackMode: mode })
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled.slice(0, count))
    setFeedbackMode(mode)
    setFinalAnswers({})
    setView('quiz')
  }

  const handleSubmit = (answers: Record<number, string>) => {
    const correct = questions.filter((q) => answers[q.id] === q.correct_answer).length
    const total = questions.length
    const percent = Math.round((correct / total) * 100)
    if (sessionId.current) {
      endQuizSession(sessionId.current, { correct, total, percent })
      sessionId.current = null
    }
    setFinalAnswers(answers)
    setView('results')
  }

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#1677ff', borderRadius: 6 },
        components: {
          Layout: { bodyBg: '#f0f2f5', headerBg: '#1677ff' },
        },
      }}
    >
      {view === 'home' && (
        <HomePage
          total={allQuestions.length}
          onSelectLearn={handleSelectLearn}
          onSelectQuiz={() => setView('setup')}
        />
      )}
      {view === 'learn' && <LearnPage onGoHome={goHome} />}
      {view === 'setup' && (
        <SetupPage total={allQuestions.length} onStart={handleStart} onGoHome={goHome} />
      )}
      {view === 'quiz' && (
        <QuizPage
          questions={questions}
          feedbackMode={feedbackMode}
          onSubmit={handleSubmit}
          onGoHome={goHome}
        />
      )}
      {view === 'results' && (
        <ResultsPage
          questions={questions}
          answers={finalAnswers}
          onRestart={() => setView('setup')}
          onGoHome={goHome}
        />
      )}
    </ConfigProvider>
  )
}
