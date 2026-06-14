import { useState } from 'react'
import { Card, Typography, Space, Row, Col, Button, Tooltip } from 'antd'
import { ReadOutlined, TrophyOutlined, BookOutlined, RightOutlined, HistoryOutlined } from '@ant-design/icons'
import SessionsDrawer from '../components/SessionsDrawer'
import { questionSources } from '../utils/questionSources'

const { Title, Text, Paragraph } = Typography

interface Props {
  onSelectLearn: () => void
  onSelectQuiz: () => void
}

export default function HomePage({ onSelectLearn, onSelectQuiz }: Props) {
  const total = questionSources[0].count // 'all' source is always first
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0277bd 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}
    >
      {/* Sessions history icon — top right */}
      <Tooltip title="Session history" placement="left">
        <Button
          shape="circle"
          icon={<HistoryOutlined />}
          onClick={() => setDrawerOpen(true)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255,255,255,0.15)',
            borderColor: 'rgba(255,255,255,0.35)',
            color: '#fff',
            fontSize: 18,
            width: 42,
            height: 42,
          }}
        />
      </Tooltip>

      {/* App title */}
      <Space direction="vertical" align="center" size={4} style={{ marginBottom: 48 }}>
        <BookOutlined style={{ fontSize: 52, color: '#fff' }} />
        <Title level={1} style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: -0.5 }}>
          Quiz App
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
          International Economics · {total} questions
        </Text>
      </Space>

      {/* Mode cards */}
      <Row gutter={[24, 24]} justify="center" style={{ width: '100%', maxWidth: 760 }}>
        {/* Learn mode */}
        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={onSelectLearn}
            style={{
              borderRadius: 14,
              border: '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.25s',
              overflow: 'hidden',
            }}
            styles={{ body: { padding: '36px 32px' } }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#1677ff'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(22,119,255,0.25)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: '#e6f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ReadOutlined style={{ fontSize: 28, color: '#1677ff' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                  Learn Mode
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                  Browse all {total} questions with correct answers highlighted. Great for studying.
                </Paragraph>
              </div>
              <Text style={{ color: '#1677ff', fontWeight: 600, fontSize: 14 }}>
                View all questions <RightOutlined />
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Quiz mode */}
        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={onSelectQuiz}
            style={{
              borderRadius: 14,
              border: '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.25s',
              overflow: 'hidden',
            }}
            styles={{ body: { padding: '36px 32px' } }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#722ed1'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(114,46,209,0.25)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: '#f9f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrophyOutlined style={{ fontSize: 28, color: '#722ed1' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                  Quiz Mode
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                  Pick a random set of questions and test yourself. Get a score at the end.
                </Paragraph>
              </div>
              <Text style={{ color: '#722ed1', fontWeight: 600, fontSize: 14 }}>
                Start quiz <RightOutlined />
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <SessionsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
