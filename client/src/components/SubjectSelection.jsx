import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Button, Typography, Alert, Spin } from 'antd';
import { subjects } from '../data/subjects';
import api from '../api/config';
import './SubjectSelection.css';

const { Title } = Typography;
const { Option } = Select;

function SubjectSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('computer-science');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const subject = subjects.find(s => s.id === selectedSubject);
  const topics = subject ? subject.topics : [];

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setError(null);
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    setSelectedSubtopic(null);
    setError(null);
  };

  const handleSubtopicChange = (value) => {
    setSelectedSubtopic(value);
    setError(null);
  };

  const handleStartQuiz = () => {
    if (!selectedTopic || !selectedSubtopic) {
      setError('Please select both a topic and subtopic');
      return;
    }

    setLoading(true);
    
    // Get the topic object
    const topic = topics.find(t => t.id === selectedTopic);
    if (!topic) {
      setError('Invalid topic selected');
      setLoading(false);
      return;
    }

    // Get the subtopic index
    const subtopicIndex = topic.subtopics.indexOf(selectedSubtopic);
    if (subtopicIndex === -1) {
      setError('Invalid subtopic selected');
      setLoading(false);
      return;
    }
    
    navigate(`/quiz/${selectedSubject}/${selectedTopic}/${subtopicIndex}`);
  };

  const handleTestApi = async () => {
    try {
      setLoading(true);
      setError(null);
      setTestResult(null);
      
      console.log('Making test API call...');
      const response = await api.post('/quiz/test');
      console.log('Test API response:', response.data);
      
      setTestResult(response.data.answer);
    } catch (error) {
      console.error('Test API error:', error);
      const errorMessage = error.response?.data?.error || error.message;
      const errorDetails = error.response?.data?.details;
      setError(`Error: ${errorMessage}${errorDetails ? `\nDetails: ${errorDetails}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const getSubtopics = () => {
    if (!selectedTopic) return [];
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.subtopics : [];
  };

  return (
    <div className="subject-selection-container">
      <Card className="selection-card">
        <Title level={2}>Start a Quiz</Title>
        
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        {testResult && (
          <Alert
            message={`Test Result: ${testResult}`}
            type="success"
            showIcon
            closable
            onClose={() => setTestResult(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <div className="selection-form">
          <div className="form-item">
            <label>Select Subject:</label>
            <Select
              placeholder="Choose a subject"
              style={{ width: '100%' }}
              onChange={handleSubjectChange}
              value={selectedSubject}
              disabled={loading}
            >
              {subjects.map((subject) => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="form-item">
            <label>Select Topic:</label>
            <Select
              placeholder="Choose a topic"
              style={{ width: '100%' }}
              onChange={handleTopicChange}
              value={selectedTopic}
              disabled={loading}
            >
              {topics.map((topic) => (
                <Option key={topic.id} value={topic.id}>
                  {topic.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="form-item">
            <label>Select Subtopic:</label>
            <Select
              placeholder={selectedTopic ? "Choose a subtopic" : "Select a topic first"}
              style={{ width: '100%' }}
              onChange={handleSubtopicChange}
              value={selectedSubtopic}
              disabled={!selectedTopic || loading}
            >
              {getSubtopics().map(subtopic => (
                <Option key={subtopic} value={subtopic} title={subtopic}>
                  {subtopic}
                </Option>
              ))}
            </Select>
          </div>

          <Button 
            type="primary" 
            size="large"
            onClick={handleStartQuiz}
            className="start-button"
            loading={loading}
            disabled={!selectedTopic || !selectedSubtopic || loading}
          >
            {loading ? 'Preparing Quiz...' : 'Start Quiz'}
          </Button>

          <Button
            onClick={handleTestApi}
            style={{ marginTop: 16 }}
            loading={loading}
          >
            Test API Connection
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SubjectSelection;
