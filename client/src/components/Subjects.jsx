import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Modal, Button, List, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, CodeOutlined, LineChartOutlined, RightOutlined } from '@ant-design/icons';
import { subjects } from '../data/subjects';
import './Subjects.css';

const { Title, Text } = Typography;

const iconMap = {
  BookOutlined: <BookOutlined />,
  CodeOutlined: <CodeOutlined />,
  LineChartOutlined: <LineChartOutlined />
};

function Subjects() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setIsModalVisible(true);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  const handleStudyModeSelect = (mode) => {
    if (!selectedTopic) {
      return;
    }

    const path = `/${mode}/${selectedSubject.id}/${selectedTopic.id}`;
    navigate(path);
    setIsModalVisible(false);
    setSelectedSubject(null);
    setSelectedTopic(null);
  };

  return (
    <div className="subjects-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="subjects-header">
          <Title level={2}>O Level Subjects</Title>
          <Text type="secondary">Select a subject to begin studying</Text>
        </div>

        <Row gutter={[24, 24]}>
          {subjects.map(subject => (
            <Col xs={24} sm={12} md={8} key={subject.id}>
              <Card
                className="subject-card"
                hoverable
                onClick={() => handleSubjectClick(subject)}
                style={{ borderTop: `3px solid ${subject.color}` }}
              >
                <div className="subject-icon" style={{ color: subject.color }}>
                  {iconMap[subject.icon]}
                </div>
                <Title level={3}>{subject.name}</Title>
                <Text type="secondary">{subject.description}</Text>
                
                <div className="topics-preview">
                  <Title level={5}>Key Topics:</Title>
                  <ul>
                    {subject.topics.slice(0, 3).map(topic => (
                      <li key={topic.id}>{topic.name}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>

      <Modal
        title={selectedSubject?.name}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedSubject(null);
          setSelectedTopic(null);
        }}
        footer={null}
        width={700}
      >
        {selectedSubject && (
          <div className="topic-selection">
            <List
              dataSource={selectedSubject.topics}
              renderItem={topic => (
                <List.Item
                  className={`topic-item ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
                  onClick={() => handleTopicSelect(topic)}
                >
                  <div className="topic-content">
                    <Title level={4}>{topic.name}</Title>
                    <ul className="subtopics-list">
                      {topic.subtopics.map((subtopic, index) => (
                        <li key={index}>{subtopic}</li>
                      ))}
                    </ul>
                  </div>
                  <RightOutlined />
                </List.Item>
              )}
            />

            <Divider />

            <div className="study-mode-selection">
              <Title level={4}>Choose Study Mode</Title>
              <Space>
                <Button
                  type="primary"
                  disabled={!selectedTopic}
                  onClick={() => handleStudyModeSelect('quiz')}
                >
                  Take Quiz
                </Button>
                <Button
                  type="primary"
                  disabled={!selectedTopic}
                  onClick={() => handleStudyModeSelect('flashcards')}
                >
                  Study Flashcards
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Subjects;
