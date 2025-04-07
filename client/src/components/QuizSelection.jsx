import React, { useState, useEffect } from 'react';
import { Steps, Card, List, Button, Typography, Space, Spin, Alert } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/config';
import './QuizSelection.css';

const { Title, Text } = Typography;

function QuizSelection() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/curriculum/o-level/${subjectId}`);
        setCurriculum(response.data);
      } catch (err) {
        console.error('Error fetching curriculum:', err);
        setError('Failed to load curriculum data');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [subjectId]);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentStep(1);
  };

  const handleSubtopicSelect = (subtopic) => {
    setSelectedSubtopic(subtopic);
    setCurrentStep(2);
  };

  const handleStartQuiz = () => {
    navigate(`/quiz/${subjectId}/${encodeURIComponent(selectedTopic.name)}/${encodeURIComponent(selectedSubtopic.name)}`);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setSelectedTopic(null);
    } else if (currentStep === 2) {
      setSelectedSubtopic(null);
    }
    setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div className="quiz-selection-container loading">
        <Spin size="large" />
        <Text>Loading curriculum...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-selection-container">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="quiz-selection-container">
      <Card>
        <Steps
          current={currentStep}
          items={[
            { title: 'Topic' },
            { title: 'Subtopic' },
            { title: 'Start Quiz' }
          ]}
          className="quiz-steps"
        />

        <div className="step-content">
          {currentStep === 0 && (
            <>
              <Title level={3}>Select a Topic</Title>
              <List
                dataSource={curriculum.topics}
                renderItem={(topic) => (
                  <List.Item 
                    onClick={() => handleTopicSelect(topic)}
                    className="selection-item"
                  >
                    <Text>{topic.name}</Text>
                  </List.Item>
                )}
              />
            </>
          )}

          {currentStep === 1 && (
            <>
              <Title level={3}>Select a Subtopic</Title>
              <List
                dataSource={selectedTopic.subtopics}
                renderItem={(subtopic) => (
                  <List.Item 
                    onClick={() => handleSubtopicSelect(subtopic)}
                    className="selection-item"
                  >
                    <Text>{subtopic.name}</Text>
                  </List.Item>
                )}
              />
            </>
          )}

          {currentStep === 2 && (
            <div className="quiz-summary">
              <Title level={3}>Ready to Start</Title>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>Subject:</Text>
                  <Text> {curriculum.subject}</Text>
                </div>
                <div>
                  <Text strong>Topic:</Text>
                  <Text> {selectedTopic.name}</Text>
                </div>
                <div>
                  <Text strong>Subtopic:</Text>
                  <Text> {selectedSubtopic.name}</Text>
                </div>
                <div>
                  <Text strong>Learning Objectives:</Text>
                  <List
                    size="small"
                    dataSource={selectedSubtopic.learningObjectives}
                    renderItem={(objective) => (
                      <List.Item>
                        <Text>{objective}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              </Space>
            </div>
          )}
        </div>

        <div className="step-actions">
          {currentStep > 0 && (
            <Button onClick={handleBack} style={{ marginRight: 8 }}>
              Back
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="primary" onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default QuizSelection;
