import { useState, useRef } from 'react'
import { ConfigProvider } from 'antd'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'
import type { Question, FeedbackMode } from './types'
import { isAnswerCorrect } from './utils/answerUtils'
import {
  startLearnSession,
  endLearnSession,
  startQuizSession,
  endQuizSession,
} from './utils/sessions'
import { shuffleOptions } from './utils/shuffle'
import { getSourceByKey } from './utils/questionSources'

type View = 'home' | 'learn' | 'setup' | 'quiz' | 'results'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [questions, setQuestions] = useState<Question[]>([])
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('end')
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(30)
  const [finalAnswers, setFinalAnswers] = useState<Record<number, string | string[]>>({})
  const sessionId = useRef<string | null>(null)

  const goHome = () => {
    if (sessionId.current) {
      if (view === 'learn') endLearnSession(sessionId.current)
      else if (view === 'quiz') endQuizSession(sessionId.current)
      sessionId.current = null
    }
    setView('home')
  }

  const handleSelectLearn = () => {
    sessionId.current = startLearnSession()
    setView('learn')
  }

  const handleStart = (
    count: number,
    mode: FeedbackMode,
    secPerQuestion: number,
    sourceKey: string
  ) => {
    const source = getSourceByKey(sourceKey)
    sessionId.current = startQuizSession({
      questionCount: count,
      feedbackMode: mode,
      secondsPerQuestion: secPerQuestion,
      source: source.label,
    })
    const shuffled = [...source.questions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled.slice(0, count).map(shuffleOptions))
    setFeedbackMode(mode)
    setSecondsPerQuestion(secPerQuestion)
    setFinalAnswers({})
    setView('quiz')
  }

  const handleSubmit = (answers: Record<number, string | string[]>) => {
    const correct = questions.filter((q) => isAnswerCorrect(answers[q.id], q.correct_answer)).length
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
          onSelectLearn={handleSelectLearn}
          onSelectQuiz={() => setView('setup')}
        />
      )}
      {view === 'learn' && <LearnPage onGoHome={goHome} />}
      {view === 'setup' && <SetupPage onStart={handleStart} onGoHome={goHome} />}
      {view === 'quiz' && (
        <QuizPage
          questions={questions}
          feedbackMode={feedbackMode}
          secondsPerQuestion={secondsPerQuestion}
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
