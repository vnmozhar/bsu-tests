import { useState, useMemo, useEffect } from 'react'
import { Card, Typography, Space, Divider, Button, Row, Col, Select } from 'antd'
import { CheckCircleFilled, HomeOutlined, BookOutlined, BulbOutlined, DatabaseOutlined } from '@ant-design/icons'
import { questionSources, getSourceByKey } from '../utils/questionSources'
import { shuffleOptions } from '../utils/shuffle'

const { Title, Text, Paragraph } = Typography

interface Props {
  onGoHome: () => void
}

const sourceOptions = questionSources.map((s) => ({
  value: s.key,
  label: `${s.label} (${s.count})`,
}))

export default function LearnPage({ onGoHome }: Props) {
  const [sourceKey, setSourceKey] = useState('all')
  const [expanded, setExpanded] = useState<number[]>([])

  // Reset expanded explanations when source changes
  useEffect(() => {
    setExpanded([])
  }, [sourceKey])

  const displayQuestions = useMemo(
    () => getSourceByKey(sourceKey).questions.map(shuffleOptions),
    [sourceKey]
  )

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
          <Row align="middle" justify="space-between" gutter={16} wrap={false}>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
                All Questions &amp; Answers
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {displayQuestions.length} questions · Correct answers highlighted in green · Click{' '}
                <BulbOutlined style={{ color: '#fa8c16' }} /> for explanation
              </Text>
            </Col>
            <Col>
              <Select
                value={sourceKey}
                onChange={setSourceKey}
                options={sourceOptions}
                style={{ minWidth: 180 }}
                suffixIcon={<DatabaseOutlined />}
              />
            </Col>
          </Row>
        </Card>

        {/* Questions list */}
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {displayQuestions.map((q, idx) => {
            const explanation = q.explanation
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
