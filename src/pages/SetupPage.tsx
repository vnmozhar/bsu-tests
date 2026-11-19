import { useState } from 'react'
import {
  Card, Button, InputNumber, Switch, Space, Typography, Divider, Slider, Row, Col, TreeSelect, Grid,
} from 'antd'
import {
  PlayCircleOutlined, BookOutlined, BulbOutlined, CheckCircleOutlined, ClockCircleOutlined,
  HomeOutlined, DatabaseOutlined,
} from '@ant-design/icons'
import type { FeedbackMode } from '../types'
import { getSourceByKey, questionSourceOptions } from '../utils/questionSources'

const { Title, Text, Paragraph } = Typography
const { useBreakpoint } = Grid

interface Props {
  onStart: (count: number, mode: FeedbackMode, secondsPerQuestion: number, sourceKey: string) => void
  onGoHome: () => void
}

export default function SetupPage({ onStart, onGoHome }: Props) {
  const screens = useBreakpoint()
  const isMobile = !screens.sm
  const [sourceKey, setSourceKey] = useState('all')
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(60)
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('end')

  const source = getSourceByKey(sourceKey)
  const total = source.count

  const [count, setCount] = useState(Math.min(10, total))

  const handleSourceChange = (value: string | number | undefined) => {
    if (value === undefined) return
    const key = String(value)
    const newSource = getSourceByKey(key)
    setSourceKey(key)
    setCount((prev) => Math.min(prev, newSource.count))
  }

  const handleCountChange = (value: number | null) => {
    if (value !== null) setCount(Math.max(1, Math.min(total, value)))
  }

  const estimateMin = Math.ceil((count * secondsPerQuestion) / 60)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0277bd 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 12 : 24,
      }}
    >
      <Card
        style={{ width: '100%', maxWidth: 520, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
        styles={{ body: { padding: isMobile ? '24px 18px' : '36px 40px' } }}
      >
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          {/* Home link */}
          <Button
            type="text"
            size={isMobile ? 'middle' : 'small'}
            icon={<HomeOutlined />}
            onClick={onGoHome}
            style={{ padding: 0, color: '#8c8c8c', marginBottom: 16 }}
          >
            На главную
          </Button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <BookOutlined style={{ fontSize: 52, color: '#1677ff', marginBottom: 12, display: 'block' }} />
            <Title level={2} style={{ margin: 0, color: '#1a1a2e' }}>Портал тестирования</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {source.label} · {total} вопросов
            </Text>
          </div>

          <Divider style={{ margin: '0 0 24px' }} />

          {/* Question bank selector */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
              Банк вопросов
            </Text>
            <TreeSelect
              value={sourceKey}
              onChange={handleSourceChange}
              treeData={questionSourceOptions}
              treeDefaultExpandAll
              treeNodeFilterProp="title"
              size={isMobile ? 'large' : 'middle'}
              style={{ width: '100%' }}
              suffixIcon={<DatabaseOutlined />}
              placeholder="Выберите предмет или тему"
            />
          </div>

          {/* Question count */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
              Количество вопросов
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Выберите, сколько случайных вопросов вы хотите ответить
            </Text>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Slider
                  min={1}
                  max={total}
                  value={count}
                  onChange={setCount}
                  tooltip={{ formatter: (v) => `${v} вопросов` }}
                  marks={isMobile ? undefined : {
                    1: '1',
                    [Math.round(total / 4)]: `${Math.round(total / 4)}`,
                    [Math.round(total / 2)]: `${Math.round(total / 2)}`,
                    [total]: `${total}`,
                  }}
                />
              </Col>
              <Col>
                <InputNumber
                  min={1}
                  max={total}
                  value={count}
                  onChange={handleCountChange}
                  style={{ width: 72 }}
                />
              </Col>
            </Row>
          </div>

          {/* Seconds per question */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
              Время на один вопрос
            </Text>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Slider
                  min={5}
                  max={60}
                  step={5}
                  value={secondsPerQuestion}
                  onChange={setSecondsPerQuestion}
                  tooltip={{ formatter: (v) => `${v} сек` }}
                  marks={isMobile ? undefined : { 5: '5с', 10: '10с', 20: '20с', 30: '30с', 60: '1м' }}
                />
              </Col>
              <Col>
                <InputNumber
                  min={5}
                  max={60}
                  step={5}
                  value={secondsPerQuestion}
                  onChange={(v) => v !== null && setSecondsPerQuestion(v)}
                  style={{ width: 72 }}
                  addonAfter="с"
                />
              </Col>
            </Row>
          </div>

          {/* Feedback mode toggle */}
          <div
            style={{
              padding: '16px 18px',
              background: feedbackMode === 'live' ? '#fffbe6' : '#f5f5f5',
              borderRadius: 8,
              border: `1px solid ${feedbackMode === 'live' ? '#ffe58f' : '#e8e8e8'}`,
              marginBottom: 28,
              transition: 'all 0.25s',
            }}
          >
            <Row align="middle" gutter={12}>
              <Col>
                <BulbOutlined
                  style={{
                    fontSize: 22,
                    color: feedbackMode === 'live' ? '#fa8c16' : '#8c8c8c',
                    transition: 'color 0.25s',
                  }}
                />
              </Col>
              <Col flex="auto">
                <Text strong style={{ display: 'block', fontSize: 14, marginBottom: 2 }}>
                  Режим обратной связи
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {feedbackMode === 'live'
                    ? 'Вы увидите, верно/неверно ли ответили, после каждого вопроса'
                    : 'Результаты будут показаны только после завершения теста'}
                </Text>
              </Col>
              <Col>
                <Switch
                  checked={feedbackMode === 'live'}
                  onChange={(checked) => setFeedbackMode(checked ? 'live' : 'end')}
                  checkedChildren="По ходу"
                  unCheckedChildren="В конце"
                />
              </Col>
            </Row>
          </div>

          {/* Info row */}
          <Row gutter={12} style={{ marginBottom: 28 }}>
            <Col span={12}>
              <div
                style={{
                  padding: '12px',
                  background: '#e6f4ff',
                  borderRadius: 8,
                  border: '1px solid #91caff',
                  textAlign: 'center',
                }}
              >
                <CheckCircleOutlined style={{ color: '#1677ff', fontSize: 18, marginBottom: 4, display: 'block' }} />
                <Text style={{ fontSize: 12, color: '#0958d9' }}>
                  {count} {count % 10 === 1 && count % 100 !== 11 ? 'вопрос' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'вопроса' : 'вопросов'}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  padding: '12px',
                  background: '#f9f0ff',
                  borderRadius: 8,
                  border: '1px solid #d3adf7',
                  textAlign: 'center',
                }}
              >
                <ClockCircleOutlined style={{ color: '#722ed1', fontSize: 18, marginBottom: 4, display: 'block' }} />
                <Text style={{ fontSize: 12, color: '#531dab' }}>
                  ~{estimateMin} мин
                </Text>
              </div>
            </Col>
          </Row>

          {/* Start button */}
          <Button
            type="primary"
            size="large"
            block
            icon={<PlayCircleOutlined />}
            onClick={() => onStart(count, feedbackMode, secondsPerQuestion, sourceKey)}
            style={{ height: 50, fontSize: 16, borderRadius: 8 }}
          >
            Начать тест
          </Button>

          <Paragraph style={{ textAlign: 'center', marginTop: 12, marginBottom: 0, fontSize: 12 }} type="secondary">
            Вопросы выбираются случайным образом из банка вопросов
          </Paragraph>
        </Space>
      </Card>
    </div>
  )
}
