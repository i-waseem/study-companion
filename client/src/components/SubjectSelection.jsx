import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Button, Typography, Alert, Spin } from 'antd';
import api from '../api/config';
import './SubjectSelection.css';

const { Title } = Typography;
const { Option } = Select;

const subjects = {
  'mathematics': {
    name: 'Mathematics',
    topics: [
      'Algebra',
      'Geometry',
      'Trigonometry',
      'Statistics',
      'Calculus'
    ]
  },
  'physics': {
    name: 'Physics',
    topics: [
      'Mechanics',
      'Waves',
      'Electricity',
      'Magnetism',
      'Nuclear Physics'
    ]
  },
  'chemistry': {
    name: 'Chemistry',
    topics: [
      'Atomic Structure',
      'Chemical Bonding',
      'Periodic Table',
      'Organic Chemistry',
      'Chemical Reactions'
    ]
  },
  'biology': {
    name: 'Biology',
    topics: [
      'Cell Biology',
      'Genetics',
      'Ecology',
      'Human Biology',
      'Evolution'
    ]
  }
};

function SubjectSelection() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedTopic(null); // Reset topic when subject changes
    setError(null); // Clear any previous errors
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    setError(null); // Clear any previous errors
  };

  const handleStartQuiz = () => {
    if (!selectedSubject || !selectedTopic) {
      setError('Please select both a subject and topic');
      return;
    }

    setLoading(true);
    
    // Convert spaces to hyphens for URL
    const subjectParam = selectedSubject.toLowerCase().replace(/ /g, '-');
    const topicParam = selectedTopic.toLowerCase().replace(/ /g, '-');
    
    navigate(`/quiz/${subjectParam}/${topicParam}`);
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
              {Object.entries(subjects).map(([key, subject]) => (
                <Option key={key} value={key}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="form-item">
            <label>Select Topic:</label>
            <Select
              placeholder={selectedSubject ? "Choose a topic" : "Select a subject first"}
              style={{ width: '100%' }}
              onChange={handleTopicChange}
              value={selectedTopic}
              disabled={!selectedSubject || loading}
            >
              {selectedSubject && 
                subjects[selectedSubject].topics.map(topic => (
                  <Option key={topic} value={topic}>
                    {topic}
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
            disabled={!selectedSubject || !selectedTopic || loading}
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
