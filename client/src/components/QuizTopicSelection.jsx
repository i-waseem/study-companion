import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Alert, Spin, Select, Steps } from 'antd';
import { BookOutlined, RightCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import api from '../api/config';
import './QuizTopicSelection.css';

const { Title, Text } = Typography;
const { Option } = Select;

function QuizTopicSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getSubjects();
        setSubjects(response.data);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSubject) return;
      try {
        setLoading(true);
        const response = await api.getCurriculum(selectedSubject);
        if (response.data && response.data.topics) {
          setTopics(response.data.topics);
        }
      } catch (err) {
        console.error('Failed to fetch topics:', err);
        setError('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedTopic || !topics.length) return;
    const topicData = topics.find(t => t.name === selectedTopic);
    if (topicData && topicData.subtopics) {
      setSubtopics(topicData.subtopics);
    }
  }, [selectedTopic, topics]);

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setCurrentStep(1);
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    setSelectedSubtopic(null);
    setCurrentStep(2);
  };

  const handleSubtopicChange = (value) => {
    setSelectedSubtopic(value);
  };

  const handleStartQuiz = () => {
    if (selectedSubject && selectedTopic && selectedSubtopic) {
      navigate(`/quiz/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedTopic)}/${encodeURIComponent(selectedSubtopic)}`);
    }
  };

  const steps = [
    {
      title: 'Subject',
      icon: <BookOutlined />
    },
    {
      title: 'Topic',
      icon: <RightCircleOutlined />
    },
    {
      title: 'Start',
      icon: <TrophyOutlined />
    }
  ];

  if (loading) {
    return (
      <div className="quiz-topic-selection">
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Spin size="large" />
            <Text>Loading...</Text>
          </Space>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-topic-selection">
        <Card>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="quiz-topic-selection">
      <Card className="quiz-setup-card">
        <Title level={2}>Start a Quiz</Title>
        <Text className="subtitle">Select your subject and topic to begin</Text>
        
        <Steps current={currentStep} items={steps} className="quiz-steps" />

        <div className="selection-container">
          <div className="select-group">
            <Text strong>Subject</Text>
            <Select
              placeholder="Select a subject"
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="subject-select"
              disabled={loading}
            >
              {subjects.map(subject => (
                <Option key={subject.urlFriendlySubject} value={subject.urlFriendlySubject}>
                  {subject.subject}
                </Option>
              ))}
            </Select>
          </div>

          {selectedSubject && (
            <div className="select-group">
              <Text strong>Topic</Text>
              <Select
                placeholder="Select a topic"
                value={selectedTopic}
                onChange={handleTopicChange}
                className="topic-select"
                disabled={!selectedSubject || loading}
              >
                {topics?.map(topic => (
                  <Option key={topic.name} value={topic.name}>{topic.name}</Option>
                )) || []}
              </Select>
            </div>
          )}

          {selectedTopic && (
            <div className="select-group">
              <Text strong>Subtopic</Text>
              <Select
                placeholder="Select a subtopic"
                value={selectedSubtopic}
                onChange={handleSubtopicChange}
                className="subtopic-select"
                disabled={!selectedTopic || loading}
              >
                {subtopics?.map(subtopic => (
                  <Option key={subtopic.name} value={subtopic.name}>{subtopic.name}</Option>
                )) || []}
              </Select>
            </div>
          )}
        </div>

        <div className="action-container">
          <Button 
            type="primary" 
            size="large" 
            onClick={handleStartQuiz}
            disabled={!selectedSubject || !selectedTopic || !selectedSubtopic}
          >
            Start Quiz
          </Button>
        </div>
      </Card>
    </div>
  );

}

export default QuizTopicSelection;
