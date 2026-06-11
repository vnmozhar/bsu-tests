import { useState } from 'react'
import { ConfigProvider } from 'antd'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'
import type { Question, FeedbackMode } from './types'
import questionsData from './data/questions.json'

const allQuestions = questionsData as Question[]

type View = 'home' | 'learn' | 'setup' | 'quiz' | 'results'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [questions, setQuestions] = useState<Question[]>([])
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('end')
  const [finalAnswers, setFinalAnswers] = useState<Record<number, string>>({})

  const goHome = () => setView('home')

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
      {view === 'home' && (
        <HomePage
          total={allQuestions.length}
          onSelectLearn={() => setView('learn')}
          onSelectQuiz={() => setView('setup')}
        />
      )}
      {view === 'learn' && (
        <LearnPage onGoHome={goHome} />
      )}
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
