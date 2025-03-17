import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Collapse, Space, Modal } from 'antd';
import { CodeOutlined, BookOutlined, LineChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import './Subjects.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const iconMap = {
  'Computer-Science': <CodeOutlined />,
  'Pakistan-Studies': <BookOutlined />,
  'Economics': <LineChartOutlined />
};

const colorMap = {
  'Computer-Science': '#1890ff',
  'Pakistan-Studies': '#52c41a',
  'Economics': '#722ed1'
};

function Subjects() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const response = await api.get('/curriculum/o-level/Computer-Science');
        setCurriculum(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch curriculum:', err);
        setError('Failed to fetch curriculum data');
        setLoading(false);
      }
    };
    fetchCurriculum();
  }, []);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleStudyModeSelect = (mode) => {
    if (mode === 'quiz') {
      navigate('/quiz');
    } else if (mode === 'flashcards') {
      navigate('/flashcards');
    }
    setSelectedSubject(null);
  };

  if (loading) {
    return (
      <div className="subjects-container">
        <Card loading={true}>
          <Title level={2}>O Level Subjects</Title>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subjects-container">
        <Card>
          <Title level={2}>Error</Title>
          <Text type="danger">{error}</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="subjects-container">
      <Title level={2}>O Level Subjects</Title>
      <Text type="secondary">Select a subject to begin studying.</Text>

      <div className="subjects-grid">
        <Card
          hoverable
          className="subject-card"
          style={{ borderTop: `2px solid ${colorMap['Computer-Science']}` }}
          onClick={() => handleSubjectClick('Computer-Science')}
        >
          {iconMap['Computer-Science']}
          <Title level={4}>Computer Science</Title>
          <Text>O Level Computer Science (2210)</Text>
          <div className="key-topics">
            <Text strong>Key Topics:</Text>
            <List
              size="small"
              dataSource={curriculum?.topics.map(t => t.name) || []}
              renderItem={item => <List.Item>{item}</List.Item>}
            />
          </div>
        </Card>
      </div>

      <Modal
        title={selectedSubject}
        open={!!selectedSubject}
        onCancel={() => setSelectedSubject(null)}
        footer={null}
        width={800}
      >
        {curriculum && (
          <>
            <Collapse defaultActiveKey={['0']} className="topics-collapse">
              {curriculum.topics.map((topic, index) => (
                <Panel header={topic.name} key={index}>
                  <List
                    dataSource={topic.subtopics}
                    renderItem={subtopic => (
                      <List.Item>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text strong>{subtopic.name}</Text>
                          <Text type="secondary">{subtopic.description}</Text>
                          <List
                            size="small"
                            dataSource={subtopic.learningObjectives}
                            renderItem={objective => (
                              <List.Item>• {objective}</List.Item>
                            )}
                          />
                        </Space>
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>

            <div className="study-mode-selection">
              <Title level={4}>Choose Study Mode</Title>
              <Space>
                <Button type="primary" onClick={() => handleStudyModeSelect('quiz')}>
                  Take Quiz
                </Button>
                <Button onClick={() => handleStudyModeSelect('flashcards')}>
                  Study Flashcards
                </Button>
              </Space>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Subjects;
