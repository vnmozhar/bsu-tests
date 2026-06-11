import { useState, useCallback } from 'react'
import {
  Card, Radio, Button, Space, Typography, Progress, Tag, Alert,
  Divider, Row, Col, Grid,
} from 'antd'
import {
  CheckCircleFilled, CloseCircleFilled, LeftOutlined, RightOutlined,
  CheckOutlined, BookOutlined, FlagOutlined,
} from '@ant-design/icons'
import type { Question, FeedbackMode } from '../types'

const { Text, Paragraph } = Typography
const { useBreakpoint } = Grid

interface Props {
  questions: Question[]
  feedbackMode: FeedbackMode
  onSubmit: (answers: Record<number, string>) => void
}

export default function QuizPage({ questions, feedbackMode, onSubmit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const screens = useBreakpoint()
  const isDesktop = !!screens.lg

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentQuestion.id]
  const isCurrentChecked = checked.has(currentQuestion.id)
  const isCurrentCorrect = currentAnswer === currentQuestion.correct_answer

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length
  const progressPercent = Math.round((answeredCount / questions.length) * 100)

  const handleAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
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
      return ans === q.correct_answer
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
    if (optionKey === currentQuestion.correct_answer) return 'quiz-option-row correct'
    if (optionKey === currentAnswer) return 'quiz-option-row wrong'
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
        <Space>
          <BookOutlined style={{ color: '#fff', fontSize: 18 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
            Quiz
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
            International Economics
          </Text>
        </Space>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
          {answeredCount} / {questions.length} answered
        </Text>
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
              {/* Section header (like Moodle's question type header) */}
              <div
                style={{
                  background: '#e8f4f8',
                  margin: '-28px -32px 24px',
                  padding: '12px 24px',
                  borderBottom: '1px solid #c9e6f0',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                <Text style={{ fontSize: 13, color: '#1677ff', fontWeight: 500 }}>
                  Select correct answer
                </Text>
              </div>

              {/* Question number badge */}
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
                Select one:
              </Text>

              {/* Options */}
              <Radio.Group
                value={currentAnswer ?? null}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value as string)}
                style={{ display: 'block' }}
                disabled={feedbackMode === 'live' && isCurrentChecked}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={0}>
                  {Object.entries(currentQuestion.options).map(([key, text]) => {
                    const isCorrectOpt = key === currentQuestion.correct_answer
                    const isSelectedOpt = key === currentAnswer
                    const showFeedback = feedbackMode === 'live' && isCurrentChecked

                    return (
                      <div key={key} className={`${getOptionClass(key)}${feedbackMode === 'live' && isCurrentChecked ? ' disabled' : ''}`}>
                        <Row align="middle" gutter={8} style={{ flexWrap: 'nowrap' }}>
                          <Col flex="auto">
                            <Radio value={key} style={{ width: '100%', margin: 0 }}>
                              <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                                <Text style={{ fontWeight: 600, marginRight: 4 }}>{key}.</Text>
                                {text}
                              </Text>
                            </Radio>
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
                  })}
                </Space>
              </Radio.Group>

              {/* Feedback alert (live mode) */}
              {feedbackMode === 'live' && isCurrentChecked && (
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
                          <strong>Correct answer: {currentQuestion.correct_answer}.</strong>{' '}
                          {currentQuestion.options[currentQuestion.correct_answer]}
                        </span>
                      )
                  }
                />
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
