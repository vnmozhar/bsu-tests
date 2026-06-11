import { useState } from 'react'
import { ConfigProvider } from 'antd'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'
import type { Question, FeedbackMode } from './types'
import questionsData from './data/questions.json'

const allQuestions = questionsData as Question[]

type View = 'setup' | 'quiz' | 'results'

export default function App() {
  const [view, setView] = useState<View>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('end')
  const [finalAnswers, setFinalAnswers] = useState<Record<number, string>>({})

  const handleStart = (count: number, mode: FeedbackMode) => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled.slice(0, count))
    setFeedbackMode(mode)
    setFinalAnswers({})
    setView('quiz')
  }

  const handleSubmit = (answers: Record<number, string>) => {
    setFinalAnswers(answers)
    setView('results')
  }

  const handleRestart = () => {
    setView('setup')
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
        components: {
          Layout: {
            bodyBg: '#f0f2f5',
            headerBg: '#1677ff',
          },
        },
      }}
    >
      {view === 'setup' && (
        <SetupPage total={allQuestions.length} onStart={handleStart} />
      )}
      {view === 'quiz' && (
        <QuizPage
          questions={questions}
          feedbackMode={feedbackMode}
          onSubmit={handleSubmit}
        />
      )}
      {view === 'results' && (
        <ResultsPage
          questions={questions}
          answers={finalAnswers}
          onRestart={handleRestart}
        />
      )}
    </ConfigProvider>
  )
}
