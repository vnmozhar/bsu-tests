import { useState, useMemo } from 'react'
import { Card, Typography, Space, Tag, Divider, Button, Row, Col } from 'antd'
import { CheckCircleFilled, HomeOutlined, BookOutlined, BulbOutlined } from '@ant-design/icons'
import type { Question } from '../types'
import questionsData from '../data/questions.json'
import explanationsData from '../data/explanations.json'
import { shuffleOptions } from '../utils/shuffle'

const sortedQuestions = [...(questionsData as Question[])].sort((a, b) => a.id - b.id)

const explanationMap = new Map(
  (explanationsData as { id: number; explanation: string }[]).map((e) => [e.id, e.explanation])
)

const { Title, Text, Paragraph } = Typography

interface Props {
  onGoHome: () => void
}

export default function LearnPage({ onGoHome }: Props) {
  const allQuestions = useMemo(() => sortedQuestions.map(shuffleOptions), [])
  const [expanded, setExpanded] = useState<number[]>([])

  const toggleExplanation = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

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
          flexShrink: 0,
        }}
      >
        <Space style={{ cursor: 'pointer' }} onClick={onGoHome} title="Back to Home">
          <BookOutlined style={{ color: '#fff', fontSize: 18 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Quiz App</Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>/ Learn Mode</Text>
        </Space>
        <Button
          icon={<HomeOutlined />}
          onClick={onGoHome}
          style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
          size="small"
        >
          Home
        </Button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px 20px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {/* Page title */}
        <Card style={{ marginBottom: 20, borderRadius: 10 }} styles={{ body: { padding: '20px 24px' } }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
                All Questions &amp; Answers
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {allQuestions.length} questions · Correct answers highlighted in green · Click{' '}
                <BulbOutlined style={{ color: '#fa8c16' }} /> for explanation
              </Text>
            </Col>
            <Col>
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {allQuestions.length} questions
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Questions list */}
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {allQuestions.map((q, idx) => {
            const explanation = explanationMap.get(q.id)
            const isExpanded = expanded.includes(q.id)

            return (
              <Card key={q.id} style={{ borderRadius: 8 }} styles={{ body: { padding: '20px 24px' } }}>
                {/* Question header */}
                <Row align="top" gutter={12} style={{ marginBottom: 14, flexWrap: 'nowrap' }}>
                  <Col>
                    <div
                      style={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#1677ff',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                  </Col>
                  <Col flex="auto">
                    <Paragraph
                      style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: '#1a1a2e', fontWeight: 500 }}
                    >
                      {q.question}
                    </Paragraph>
                  </Col>
                </Row>

                <Divider style={{ margin: '0 0 12px' }} />

                {/* Options */}
                <Space direction="vertical" size={4} style={{ width: '100%', paddingLeft: 44 }}>
                  {Object.entries(q.options).map(([key, text]) => {
                    const isCorrect = key === q.correct_answer
                    return (
                      <div
                        key={key}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          background: isCorrect ? '#f6ffed' : '#fafafa',
                          border: `1px solid ${isCorrect ? '#b7eb8f' : '#f0f0f0'}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: isCorrect ? '#389e0d' : '#595959',
                            fontWeight: isCorrect ? 600 : 400,
                            flex: 1,
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: 6, color: isCorrect ? '#389e0d' : '#8c8c8c' }}>
                            {key}.
                          </span>
                          {text}
                        </Text>
                        {isCorrect && (
                          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16, flexShrink: 0, marginTop: 1 }} />
                        )}
                      </div>
                    )
                  })}
                </Space>

                {/* Explanation toggle */}
                {explanation && (
                  <div style={{ paddingLeft: 44, marginTop: 12 }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<BulbOutlined style={{ color: '#fa8c16' }} />}
                      onClick={() => toggleExplanation(q.id)}
                      style={{ padding: '0 4px', color: isExpanded ? '#fa8c16' : '#8c8c8c', fontWeight: 500 }}
                    >
                      {isExpanded ? 'Hide explanation' : 'Show explanation'}
                    </Button>

                    {isExpanded && (
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
                          {explanation}
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </Space>

        {/* Bottom home button */}
        <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 24 }}>
          <Button
            icon={<HomeOutlined />}
            size="large"
            onClick={onGoHome}
            style={{ borderRadius: 8, height: 44, paddingInline: 28 }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
