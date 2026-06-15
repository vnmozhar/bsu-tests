import { useState } from 'react'
import {
  Card, Button, Typography, Progress, Space, Tag, Divider, Row, Col, Statistic,
} from 'antd'
import {
  CheckCircleFilled, CloseCircleFilled, TrophyOutlined, ReloadOutlined,
  CheckOutlined, CloseOutlined, HomeOutlined, BookOutlined, BulbOutlined,
} from '@ant-design/icons'
import type { Question } from '../types'
import { isAnswerCorrect } from '../utils/answerUtils'

const { Title, Text, Paragraph } = Typography

interface Props {
  questions: Question[]
  answers: Record<number, string | string[]>
  onRestart: () => void
  onGoHome: () => void
}

function getGrade(percent: number): { label: string; color: string } {
  if (percent >= 90) return { label: 'Excellent!', color: '#52c41a' }
  if (percent >= 75) return { label: 'Good!', color: '#1677ff' }
  if (percent >= 60) return { label: 'Satisfactory', color: '#fa8c16' }
  return { label: 'Needs improvement', color: '#ff4d4f' }
}

export default function ResultsPage({ questions, answers, onRestart, onGoHome }: Props) {
  const [expandedExpl, setExpandedExpl] = useState<number[]>([])

  const toggleExpl = (id: number) =>
    setExpandedExpl((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const correctCount = questions.filter((q) => isAnswerCorrect(answers[q.id], q.correct_answer)).length
  const total = questions.length
  const percent = Math.round((correctCount / total) * 100)
  const grade = getGrade(percent)

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
          flexShrink: 0,
        }}
      >
        <Space style={{ cursor: 'pointer' }} onClick={onGoHome} title="Back to Home">
          <BookOutlined style={{ color: '#fff', fontSize: 18 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Quiz App</Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>/ Results</Text>
        </Space>
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
      </div>

      <div style={{ flex: 1, padding: '24px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Score card */}
        <Card
          style={{ marginBottom: 24, textAlign: 'center', borderRadius: 10 }}
          styles={{ body: { padding: '40px 32px' } }}
        >
          <Space direction="vertical" align="center" size={20} style={{ width: '100%' }}>
            <TrophyOutlined style={{ fontSize: 56, color: grade.color }} />

            <Title level={2} style={{ margin: 0, color: grade.color }}>
              {grade.label}
            </Title>

            <Progress
              type="circle"
              percent={percent}
              strokeColor={grade.color}
              trailColor="#f0f0f0"
              size={140}
              format={(p) => (
                <span style={{ fontSize: 28, fontWeight: 800, color: grade.color }}>
                  {p}%
                </span>
              )}
            />

            <Row gutter={48} justify="center">
              <Col>
                <Statistic
                  title="Correct"
                  value={correctCount}
                  suffix={`/ ${total}`}
                  valueStyle={{ color: '#52c41a', fontWeight: 700 }}
                  prefix={<CheckOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="Incorrect"
                  value={total - correctCount}
                  suffix={`/ ${total}`}
                  valueStyle={{ color: '#ff4d4f', fontWeight: 700 }}
                  prefix={<CloseOutlined />}
                />
              </Col>
            </Row>

            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={onRestart}
              style={{ borderRadius: 8, height: 46, paddingInline: 32, fontSize: 15 }}
            >
              Start new quiz
            </Button>
          </Space>
        </Card>

        {/* Review card */}
        <Card
          title={
            <Space>
              <CheckCircleFilled style={{ color: '#1677ff' }} />
              <Text strong>Review: Questions &amp; Answers</Text>
              <Tag color="blue">{total} questions</Tag>
            </Space>
          }
          style={{ borderRadius: 10 }}
          styles={{ body: { padding: '0 24px' } }}
        >
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id]
            const isCorrect = isAnswerCorrect(userAnswer, q.correct_answer)
            const correctAnswerArr = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer]

            return (
              <div key={q.id}>
                <div style={{ padding: '20px 0' }}>
                  {/* Question header row */}
                  <Row align="middle" gutter={10} style={{ marginBottom: 12, flexWrap: 'nowrap' }}>
                    <Col>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: isCorrect ? '#f6ffed' : '#fff2f0',
                          border: `2px solid ${isCorrect ? '#52c41a' : '#ff4d4f'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: 11,
                          fontWeight: 700,
                          color: isCorrect ? '#52c41a' : '#ff4d4f',
                        }}
                      >
                        {idx + 1}
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Space size={6}>
                        {isCorrect ? (
                          <Tag
                            icon={<CheckCircleFilled />}
                            color="success"
                            style={{ margin: 0 }}
                          >
                            Correct
                          </Tag>
                        ) : (
                          <Tag
                            icon={<CloseCircleFilled />}
                            color="error"
                            style={{ margin: 0 }}
                          >
                            Incorrect
                          </Tag>
                        )}
                      </Space>
                    </Col>
                  </Row>

                  {/* Question text */}
                  <Paragraph
                    style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 14, color: '#1a1a2e', paddingLeft: 36 }}
                  >
                    {q.question}
                  </Paragraph>

                  {/* Options */}
                  <div style={{ paddingLeft: 36 }}>
                    <Space direction="vertical" size={3} style={{ width: '100%' }}>
                      {Object.entries(q.options).map(([key, text]) => {
                        const isCorrectOpt = correctAnswerArr.includes(key)
                        const isUserOpt = Array.isArray(userAnswer)
                          ? userAnswer.includes(key)
                          : key === userAnswer

                        let bg = 'transparent'
                        let borderColor = 'transparent'
                        let textColor = '#595959'

                        if (isCorrectOpt) {
                          bg = '#f6ffed'
                          borderColor = '#b7eb8f'
                          textColor = '#389e0d'
                        } else if (isUserOpt) {
                          bg = '#fff2f0'
                          borderColor = '#ffa39e'
                          textColor = '#cf1322'
                        }

                        return (
                          <div
                            key={key}
                            style={{
                              padding: '7px 12px',
                              borderRadius: 5,
                              background: bg,
                              border: `1px solid ${borderColor}`,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                color: textColor,
                                fontWeight: isCorrectOpt || isUserOpt ? 600 : 400,
                                flex: 1,
                                lineHeight: 1.5,
                              }}
                            >
                              <span style={{ marginRight: 6, fontWeight: 700 }}>{key}.</span>
                              {text}
                            </Text>
                            {isCorrectOpt && (
                              <CheckCircleFilled style={{ color: '#52c41a', fontSize: 15, flexShrink: 0, marginTop: 2 }} />
                            )}
                            {isUserOpt && !isCorrectOpt && (
                              <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 15, flexShrink: 0, marginTop: 2 }} />
                            )}
                          </div>
                        )
                      })}
                    </Space>

                    {/* Wrong answer summary */}
                    {!isCorrect && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '8px 12px',
                          background: '#fff7e6',
                          borderRadius: 5,
                          borderLeft: '3px solid #fa8c16',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#873800' }}>
                          Your answer:{' '}
                          <Text style={{ fontWeight: 600, color: '#cf1322' }}>
                            {Array.isArray(userAnswer)
                              ? userAnswer.map((k) => `${k}. ${q.options[k]}`).join(', ')
                              : userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : '—'}
                          </Text>
                          {'  →  '}
                          Correct:{' '}
                          <Text style={{ fontWeight: 600, color: '#389e0d' }}>
                            {Array.isArray(q.correct_answer)
                              ? q.correct_answer.map((k) => `${k}. ${q.options[k]}`).join(', ')
                              : `${q.correct_answer}. ${q.options[q.correct_answer]}`}
                          </Text>
                        </Text>
                      </div>
                    )}

                    {/* Explanation toggle */}
                    {q.explanation && (
                      <div style={{ marginTop: 10 }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<BulbOutlined style={{ color: '#fa8c16' }} />}
                          onClick={() => toggleExpl(q.id)}
                          style={{
                            padding: '0 4px',
                            color: expandedExpl.includes(q.id) ? '#fa8c16' : '#8c8c8c',
                            fontWeight: 500,
                          }}
                        >
                          {expandedExpl.includes(q.id) ? 'Hide explanation' : 'Show explanation'}
                        </Button>

                        {expandedExpl.includes(q.id) && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: '12px 14px',
                              background: '#fffbe6',
                              border: '1px solid #ffe58f',
                              borderLeft: '3px solid #fa8c16',
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ fontSize: 13, color: '#614700', lineHeight: 1.7 }}>
                              {q.explanation}
                            </Text>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {idx < questions.length - 1 && <Divider style={{ margin: 0 }} />}
              </div>
            )
          })}
        </Card>

        {/* Bottom buttons */}
        <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 24 }}>
          <Space size={12}>
            <Button
              icon={<HomeOutlined />}
              size="large"
              onClick={onGoHome}
              style={{ borderRadius: 8, height: 44, paddingInline: 24 }}
            >
              Home
            </Button>
            <Button
              type="default"
              size="large"
              icon={<ReloadOutlined />}
              onClick={onRestart}
              style={{ borderRadius: 8, height: 44, paddingInline: 24 }}
            >
              New quiz
            </Button>
          </Space>
        </div>
      </div>
      </div>
    </div>
  )
}
