import { useState, useEffect } from 'react'
import {
  Drawer, Button, Space, Typography, Tag, Empty, List, Divider, Popconfirm, Tooltip, Grid,
} from 'antd'
import {
  DownloadOutlined, DeleteOutlined, ReadOutlined, TrophyOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import {
  getSessions, clearSessions, downloadLog, formatDateTime, formatDuration,
} from '../utils/sessions'
import type { Session, QuizSession } from '../utils/sessions'

const { Text } = Typography
const { useBreakpoint } = Grid

interface Props {
  open: boolean
  onClose: () => void
}

export default function SessionsDrawer({ open, onClose }: Props) {
  const screens = useBreakpoint()
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    if (open) setSessions([...getSessions()].reverse()) // newest first
  }, [open])

  const handleClear = () => {
    clearSessions()
    setSessions([])
  }

  const handleDownload = () => {
    downloadLog([...sessions].reverse()) // chronological order in file
  }

  return (
    <Drawer
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <span>История попыток</span>
          {sessions.length > 0 && (
            <Tag color="blue" style={{ fontWeight: 400 }}>
              {sessions.length}
            </Tag>
          )}
        </Space>
      }
      open={open}
      onClose={onClose}
      width={screens.sm ? 420 : '100vw'}
      extra={
        sessions.length > 0 ? (
          <Space>
            <Tooltip title="Скачать sessions.log">
              <Button
                icon={<DownloadOutlined />}
                size="small"
                onClick={handleDownload}
              >
                Скачать .log
              </Button>
            </Tooltip>
            <Popconfirm
              title="Очистить все попытки?"
              description="Это действие необратимо."
              onConfirm={handleClear}
              okText="Очистить"
              okButtonProps={{ danger: true }}
            >
              <Button icon={<DeleteOutlined />} size="small" danger>
                Очистить
              </Button>
            </Popconfirm>
          </Space>
        ) : null
      }
    >
      {sessions.length === 0 ? (
        <Empty
          description="Нет записанных попыток"
          style={{ marginTop: 80 }}
        />
      ) : (
        <List
          dataSource={sessions}
          renderItem={(s, idx) => <SessionItem session={s} key={s.id} isFirst={idx === 0} />}
        />
      )}
    </Drawer>
  )
}

function SessionItem({ session, isFirst }: { session: Session; isFirst: boolean }) {
  const isQuiz = session.type === 'quiz'
  const q = session as QuizSession

  return (
    <>
      {!isFirst && <Divider style={{ margin: '0' }} />}
      <div style={{ padding: '16px 0' }}>
        {/* Header row */}
        <Space style={{ marginBottom: 10, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space>
            {isQuiz ? (
              <TrophyOutlined style={{ color: '#722ed1', fontSize: 16 }} />
            ) : (
              <ReadOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            )}
            <Tag
              color={isQuiz ? 'purple' : 'blue'}
              style={{ margin: 0, fontWeight: 600 }}
            >
              {isQuiz ? 'ТЕСТ' : 'ОБУЧЕНИЕ'}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatDateTime(session.startTime)}
          </Text>
        </Space>

        {/* Details */}
        <div
          style={{
            background: '#fafafa',
            borderRadius: 6,
            padding: '10px 12px',
            border: '1px solid #f0f0f0',
          }}
        >
          {isQuiz ? (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap>
                <Text style={{ fontSize: 13 }}>
                  <Text type="secondary">Вопросов: </Text>
                  <Text strong>{q.setup.questionCount}</Text>
                </Text>
                <Text style={{ fontSize: 13 }}>
                  <Text type="secondary">Режим: </Text>
                  <Tag
                    color={q.setup.feedbackMode === 'live' ? 'orange' : 'default'}
                    style={{ margin: 0, fontSize: 11 }}
                  >
                    {q.setup.feedbackMode === 'live' ? 'По ходу' : 'В конце'}
                  </Tag>
                </Text>
              </Space>

              {q.result ? (
                <Space wrap>
                  {q.result.percent >= 60 ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  <Text style={{ fontSize: 13 }}>
                    <Text strong style={{ color: q.result.percent >= 75 ? '#52c41a' : q.result.percent >= 60 ? '#fa8c16' : '#ff4d4f' }}>
                      {q.result.correct}/{q.result.total}
                    </Text>
                    <Text type="secondary"> ({q.result.percent}%)</Text>
                  </Text>
                </Space>
              ) : (
                <Tag color="warning" style={{ margin: 0, fontSize: 11 }}>Прервано</Tag>
              )}
            </Space>
          ) : (
            <Text type="secondary" style={{ fontSize: 13 }}>
              Просмотрены все вопросы
            </Text>
          )}

          <Divider style={{ margin: '8px 0' }} />

          <Text type="secondary" style={{ fontSize: 12 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            Длительность: <Text style={{ fontSize: 12 }}>{formatDuration(session.duration)}</Text>
          </Text>
        </div>
      </div>
    </>
  )
}
