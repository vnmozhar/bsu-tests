import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Card, Radio, Checkbox, Button, Space, Typography, Progress, Tag, Alert,
  Divider, Row, Col, Grid,
} from 'antd'
import {
  CheckCircleFilled, CloseCircleFilled, LeftOutlined, RightOutlined,
  CheckOutlined, BookOutlined, FlagOutlined, HomeOutlined, BulbOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { Question, FeedbackMode } from '../types'
import { isAnswerCorrect } from '../utils/answerUtils'

const { Text, Paragraph } = Typography
const { useBreakpoint } = Grid

interface Props {
  questions: Question[]
  feedbackMode: FeedbackMode
  secondsPerQuestion: number
  onSubmit: (answers: Record<number, string | string[]>) => void
  onGoHome: () => void
}

export default function QuizPage({ questions, feedbackMode, secondsPerQuestion, onSubmit, onGoHome }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion)
  const screens = useBreakpoint()
  const isDesktop = !!screens.lg

  // Stable refs to avoid stale closures in timer effects
  const answersRef = useRef(answers)
  const onSubmitRef = useRef(onSubmit)
  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { onSubmitRef.current = onSubmit }, [onSubmit])

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(secondsPerQuestion)
  }, [currentIndex, secondsPerQuestion])

  // Count down every second
  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft])

  // Auto-advance when time runs out.
  // This effect only fires when timeLeft *changes* — not when currentIndex changes —
  // so there is no double-advance risk even though timeLeft is 0 across the index bump.
  useEffect(() => {
    if (timeLeft !== 0) return
    setCurrentIndex((ci) => {
      if (ci < questions.length - 1) return ci + 1
      onSubmitRef.current(answersRef.current)
      return ci
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentQuestion.id]
  const isCurrentChecked = checked.has(currentQuestion.id)
  const isMultiAnswer = Array.isArray(currentQuestion.correct_answer)
  const correctAnswerArr = Array.isArray(currentQuestion.correct_answer)
    ? currentQuestion.correct_answer
    : [currentQuestion.correct_answer]
  const isCurrentCorrect = isAnswerCorrect(currentAnswer, currentQuestion.correct_answer)

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length
  const progressPercent = Math.round((answeredCount / questions.length) * 100)

  // Timer color: green → orange → red as time runs out
  const timerRatio = secondsPerQuestion > 0 ? timeLeft / secondsPerQuestion : 1
  const timerColor =
    timerRatio > 0.5 ? '#52c41a' : timerRatio > 0.25 ? '#fa8c16' : '#ff4d4f'
  const timerUrgent = timerRatio <= 0.25

  const handleAnswer = useCallback((questionId: number, value: string | string[]) => {
    setAnswers((prev) => {
      // Don't store empty selection for multi-answer questions
      if (Array.isArray(value) && value.length === 0) {
        const { [questionId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [questionId]: value }
    })
  }, [])

  const handleCheck = useCallback(() => {
    if (currentAnswer) {
      setChecked((prev) => new Set([...prev, currentQuestion.id]))
    }
  }, [currentAnswer, currentQuestion.id])

  const getNavStyle = (idx: number): React.CSSProperties => {
    const q = questions[idx]
    const ans = answers[q.id]
    const isChk = checked.has(q.id)
    const isCurrent = idx === currentIndex

    if (isCurrent) {
      return { background: '#1677ff', borderColor: '#1677ff', color: '#fff' }
    }
    if (feedbackMode === 'live' && isChk) {
      return isAnswerCorrect(ans, q.correct_answer)
        ? { background: '#52c41a', borderColor: '#52c41a', color: '#fff' }
        : { background: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff' }
    }
    if (ans) {
      return { background: '#8c8c8c', borderColor: '#8c8c8c', color: '#fff' }
    }
    return { background: '#fff', borderColor: '#d9d9d9', color: '#595959' }
  }

  const getOptionClass = (optionKey: string) => {
    if (feedbackMode === 'end' || !isCurrentChecked) return 'quiz-option-row'
    const isCorrectOpt = correctAnswerArr.includes(optionKey)
    const isSelectedOpt = Array.isArray(currentAnswer)
      ? currentAnswer.includes(optionKey)
      : currentAnswer === optionKey
    if (isCorrectOpt) return 'quiz-option-row correct'
    if (isSelectedOpt) return 'quiz-option-row wrong'
    return 'quiz-option-row'
  }

  const NavigationPanel = () => (
    <Card
      title={
        <Text strong style={{ fontSize: 13 }}>
          Quiz navigation
        </Text>
      }
      size="small"
      styles={{ header: { background: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }, body: { padding: '14px' } }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {questions.map((_, idx) => (
          <button
            key={idx}
            className="quiz-nav-btn"
            onClick={() => setCurrentIndex(idx)}
            style={getNavStyle(idx)}
            title={`Question ${idx + 1}${answers[questions[idx].id] ? ' (answered)' : ''}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {feedbackMode === 'live' && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="default" style={{ margin: 0, fontSize: 11 }}>Unanswered</Tag>
          <Tag color="default" style={{ margin: 0, fontSize: 11, background: '#8c8c8c', color: '#fff', border: 'none' }}>Answered</Tag>
          <Tag color="success" style={{ margin: 0, fontSize: 11 }}>Correct</Tag>
          <Tag color="error" style={{ margin: 0, fontSize: 11 }}>Wrong</Tag>
        </div>
      )}
    </Card>
  )

  const InfoPanel = () => (
    <Card
      size="small"
      styles={{ body: { padding: '12px' } }}
      style={{ borderColor: '#e8e8e8' }}
    >
      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
        Question {currentIndex + 1}
      </Text>
      <div style={{ marginTop: 8 }}>
        {currentAnswer ? (
          <Tag color="success" icon={<CheckCircleFilled />} style={{ fontSize: 11 }}>
            Answered
          </Tag>
        ) : (
          <Tag color="default" style={{ fontSize: 11 }}>
            Not answered
          </Tag>
        )}
      </div>
      <Divider style={{ margin: '10px 0' }} />
      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
        Marked out of
      </Text>
      <Text style={{ fontSize: 14, fontWeight: 600 }}>1.00</Text>
      <Divider style={{ margin: '10px 0' }} />
      <Button
        type="text"
        size="small"
        icon={<FlagOutlined />}
        style={{ padding: 0, fontSize: 11, color: '#8c8c8c', height: 'auto' }}
      >
        Flag question
      </Button>
    </Card>
  )

  const showFeedback = feedbackMode === 'live' && isCurrentChecked

  const optionItems = Object.entries(currentQuestion.options).map(([key, text]) => {
    const isCorrectOpt = correctAnswerArr.includes(key)
    const isSelectedOpt = Array.isArray(currentAnswer)
      ? currentAnswer.includes(key)
      : currentAnswer === key

    return (
      <div key={key} className={`${getOptionClass(key)}${showFeedback ? ' disabled' : ''}`}>
        <Row align="middle" gutter={8} style={{ flexWrap: 'nowrap' }}>
          <Col flex="auto">
            {isMultiAnswer ? (
              <Checkbox value={key} style={{ width: '100%', margin: 0 }}>
                <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <Text style={{ fontWeight: 600, marginRight: 4 }}>{key}.</Text>
                  {text}
                </Text>
              </Checkbox>
            ) : (
              <Radio value={key} style={{ width: '100%', margin: 0 }}>
                <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <Text style={{ fontWeight: 600, marginRight: 4 }}>{key}.</Text>
                  {text}
                </Text>
              </Radio>
            )}
          </Col>
          {showFeedback && isCorrectOpt && (
            <Col>
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />
            </Col>
          )}
          {showFeedback && isSelectedOpt && !isCorrectOpt && (
            <Col>
              <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 18 }} />
            </Col>
          )}
        </Row>
      </div>
    )
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          background: '#1677ff',
          padding: '0 24px',
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Space
          style={{ cursor: 'pointer' }}
          onClick={onGoHome}
          title="Back to Home"
        >
          <BookOutlined style={{ color: '#fff', fontSize: 18 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
            Quiz App
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
            / Quiz Mode
          </Text>
        </Space>
        <Space>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
            {answeredCount} / {questions.length} answered
          </Text>
          <Button
            icon={<HomeOutlined />}
            size="small"
            onClick={onGoHome}
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff',
            }}
          >
            Home
          </Button>
        </Space>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', padding: '6px 24px', borderBottom: '1px solid #e8e8e8' }}>
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="#1677ff"
          trailColor="#e8e8e8"
          size={['100%', 6]}
        />
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '16px 20px' }}>
        <Row gutter={12}>
          {/* Left info panel — desktop only */}
          {isDesktop && (
            <Col lg={4}>
              <InfoPanel />
            </Col>
          )}

          {/* Main question */}
          <Col xs={24} lg={isDesktop ? 16 : 24}>
            <Card
              styles={{ body: { padding: '28px 32px' } }}
              style={{ marginBottom: 16 }}
            >
              {/* Section header with timer */}
              <div
                style={{
                  background: '#e8f4f8',
                  margin: '-28px -32px 24px',
                  padding: '12px 24px',
                  borderBottom: '1px solid #c9e6f0',
                  borderRadius: '6px 6px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 13, color: '#1677ff', fontWeight: 500 }}>
                  {isMultiAnswer ? 'Select all correct answers' : 'Select correct answer'}
                </Text>
                <Space size={4}>
                  <ClockCircleOutlined style={{ color: timerColor, fontSize: 13 }} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: timerUrgent ? 700 : 500,
                      color: timerColor,
                      minWidth: 32,
                      textAlign: 'right',
                    }}
                  >
                    {timeLeft}s
                  </Text>
                </Space>
              </div>

              {/* Question number badge + text */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#1677ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {currentIndex + 1}
                </div>
                <Paragraph
                  style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: '#1a1a2e' }}
                >
                  {currentQuestion.question}
                </Paragraph>
              </div>

              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>
                {isMultiAnswer ? 'Select all that apply:' : 'Select one:'}
              </Text>

              {/* Options */}
              {isMultiAnswer ? (
                <Checkbox.Group
                  value={Array.isArray(currentAnswer) ? currentAnswer : []}
                  onChange={(values) => handleAnswer(currentQuestion.id, values as string[])}
                  style={{ display: 'block' }}
                  disabled={feedbackMode === 'live' && isCurrentChecked}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={0}>
                    {optionItems}
                  </Space>
                </Checkbox.Group>
              ) : (
                <Radio.Group
                  value={currentAnswer ?? null}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value as string)}
                  style={{ display: 'block' }}
                  disabled={feedbackMode === 'live' && isCurrentChecked}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={0}>
                    {optionItems}
                  </Space>
                </Radio.Group>
              )}

              {/* Feedback alert + explanation (live mode) */}
              {feedbackMode === 'live' && isCurrentChecked && (
                <>
                  <Alert
                    style={{ marginTop: 16 }}
                    type={isCurrentCorrect ? 'success' : 'error'}
                    showIcon
                    message={
                      isCurrentCorrect
                        ? 'Correct! Well done.'
                        : (
                          <span>
                            Incorrect.{' '}
                            {Array.isArray(currentQuestion.correct_answer) ? (
                              <>
                                <strong>
                                  Correct answers: {currentQuestion.correct_answer.join(', ')}.
                                </strong>{' '}
                                {currentQuestion.correct_answer
                                  .map((k) => currentQuestion.options[k])
                                  .join('; ')}
                              </>
                            ) : (
                              <>
                                <strong>Correct answer: {currentQuestion.correct_answer}.</strong>{' '}
                                {currentQuestion.options[currentQuestion.correct_answer]}
                              </>
                            )}
                          </span>
                        )
                    }
                  />
                  {currentQuestion.explanation && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '12px 14px',
                        background: '#fffbe6',
                        border: '1px solid #ffe58f',
                        borderLeft: '3px solid #fa8c16',
                        borderRadius: 6,
                      }}
                    >
                      <Space style={{ marginBottom: 4 }}>
                        <BulbOutlined style={{ color: '#fa8c16' }} />
                        <Text style={{ fontSize: 12, fontWeight: 600, color: '#874d00' }}>Explanation</Text>
                      </Space>
                      <Text style={{ fontSize: 13, color: '#614700', lineHeight: 1.7, display: 'block' }}>
                        {currentQuestion.explanation}
                      </Text>
                    </div>
                  )}
                </>
              )}

              {/* Action buttons */}
              <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {feedbackMode === 'live' && !isCurrentChecked && currentAnswer && (
                  <Button
                    onClick={handleCheck}
                    icon={<CheckOutlined />}
                    style={{ background: '#f0f7ff', borderColor: '#1677ff', color: '#1677ff' }}
                  >
                    Check
                  </Button>
                )}
                <Button
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  disabled={currentIndex === 0}
                  icon={<LeftOutlined />}
                >
                  Previous
                </Button>
                {currentIndex < questions.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={() => setCurrentIndex((i) => i + 1)}
                    iconPosition="end"
                    icon={<RightOutlined />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    danger
                    disabled={!allAnswered}
                    onClick={() => onSubmit(answers)}
                    style={{ marginLeft: !isDesktop ? 'auto' : undefined }}
                  >
                    Finish attempt
                  </Button>
                )}
              </div>
            </Card>

            {/* Navigation panel for mobile/tablet */}
            {!isDesktop && (
              <NavigationPanel />
            )}
          </Col>

          {/* Right navigation panel — desktop only */}
          {isDesktop && (
            <Col lg={4}>
              <NavigationPanel />
            </Col>
          )}
        </Row>
      </div>
    </div>
  )
}
