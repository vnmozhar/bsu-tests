import { useState, useMemo, useEffect } from 'react'
import { Card, Typography, Space, Divider, Button, Row, Col, TreeSelect, Grid, Radio, Switch } from 'antd'
import { CheckCircleFilled, HomeOutlined, BookOutlined, BulbOutlined, DatabaseOutlined } from '@ant-design/icons'
import { getSourceByKey, questionSourceOptions } from '../utils/questionSources'
import { shuffleOptions } from '../utils/shuffle'

const { Title, Text, Paragraph } = Typography
const { useBreakpoint } = Grid

interface Props {
  onGoHome: () => void
}

export default function LearnPage({ onGoHome }: Props) {
  const screens = useBreakpoint()
  const isMobile = !screens.sm
  const [sourceKey, setSourceKey] = useState('all')
  const [expanded, setExpanded] = useState<number[]>([])
  const [shuffleAnswers, setShuffleAnswers] = useState(true)
  const [labelStyle, setLabelStyle] = useState<'number' | 'cyrillic' | 'latin'>('cyrillic')

  // Reset expanded explanations when source changes
  useEffect(() => {
    setExpanded([])
  }, [sourceKey])

  const displayQuestions = useMemo(
    () => getSourceByKey(sourceKey).questions.map((question) => {
      const ordered = shuffleAnswers ? shuffleOptions(question) : question
      const labels = labelStyle === 'number'
        ? ['1', '2', '3', '4', '5', '6']
        : labelStyle === 'latin' ? ['a', 'b', 'c', 'd', 'e', 'f'] : ['а', 'б', 'в', 'г', 'д', 'е']
      const entries = Object.entries(ordered.options)
      const keyMap: Record<string, string> = {}
      const options: Record<string, string> = {}
      entries.forEach(([key, text], index) => {
        const label = labels[index] ?? String(index + 1)
        keyMap[key] = label
        options[label] = text
      })
      const correct_answer = Array.isArray(ordered.correct_answer)
        ? ordered.correct_answer.map((key) => keyMap[key])
        : keyMap[ordered.correct_answer]
      return { ...ordered, options, correct_answer }
    }),
    [sourceKey, shuffleAnswers, labelStyle]
  )

  const handleSourceChange = (value: string | number | undefined) => {
    if (value !== undefined) setSourceKey(String(value))
  }

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
          padding: isMobile ? '0 12px' : '0 24px',
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}
      >
        <Space style={{ cursor: 'pointer' }} onClick={onGoHome} title="На главную">
          <BookOutlined style={{ color: '#fff', fontSize: 18 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Портал тестирования</Text>
          {!isMobile && (
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>/ Режим обучения</Text>
          )}
        </Space>
        <Button
          icon={<HomeOutlined />}
          aria-label="На главную"
          title="На главную"
          onClick={onGoHome}
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderColor: 'rgba(255,255,255,0.3)',
            color: '#fff',
            width: isMobile ? 40 : undefined,
            height: isMobile ? 40 : undefined,
          }}
          size={isMobile ? 'middle' : 'small'}
        >
          {!isMobile && 'На главную'}
        </Button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {/* Page title */}
        <Card style={{ marginBottom: 20, borderRadius: 10 }} styles={{ body: { padding: isMobile ? 16 : '20px 24px' } }}>
          <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
            Все вопросы &amp; ответы
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {displayQuestions.length} вопросов · Правильные ответы выделены зеленым · Нажмите{' '}
            <BulbOutlined style={{ color: '#fa8c16' }} /> для объяснения
          </Text>
          <TreeSelect
            value={sourceKey}
            onChange={handleSourceChange}
            treeData={questionSourceOptions}
            treeDefaultExpandAll
            treeNodeFilterProp="title"
            size={isMobile ? 'large' : 'middle'}
            style={{ width: '100%', marginTop: 16 }}
            suffixIcon={<DatabaseOutlined />}
            placeholder="Выберите предмет или тему"
          />
          <Space direction={isMobile ? 'vertical' : 'horizontal'} size={16} style={{ marginTop: 16, width: '100%' }}>
            <Space>
              <Text>Случайный порядок ответов</Text>
              <Switch checked={shuffleAnswers} onChange={setShuffleAnswers} />
            </Space>
            <Space wrap>
              <Text>Нумерация:</Text>
              <Radio.Group value={labelStyle} onChange={(event) => setLabelStyle(event.target.value)} optionType="button" buttonStyle="solid" size="small">
                <Radio.Button value="number">Цифрами</Radio.Button>
                <Radio.Button value="cyrillic">Кириллицей</Radio.Button>
                <Radio.Button value="latin">Латиницей</Radio.Button>
              </Radio.Group>
            </Space>
          </Space>
        </Card>

        {/* Questions list */}
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {displayQuestions.map((q, idx) => {
            const explanation = q.explanation
            const isExpanded = expanded.includes(q.id)

            return (
              <Card key={q.id} style={{ borderRadius: 8 }} styles={{ body: { padding: isMobile ? 16 : '20px 24px' } }}>
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
                <Space direction="vertical" size={4} style={{ width: '100%', paddingLeft: isMobile ? 32 : 44 }}>
                  {Object.entries(q.options).map(([key, text]) => {
                    const correctArr = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer]
                    const isCorrect = correctArr.includes(key)
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
                  <div style={{ paddingLeft: isMobile ? 32 : 44, marginTop: 12 }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<BulbOutlined style={{ color: '#fa8c16' }} />}
                      onClick={() => toggleExplanation(q.id)}
                      style={{ padding: '0 4px', color: isExpanded ? '#fa8c16' : '#8c8c8c', fontWeight: 500 }}
                    >
                      {isExpanded ? 'Скрыть объяснение' : 'Показать объяснение'}
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
            На главную
          </Button>
        </div>
      </div>
    </div>
  )
}
