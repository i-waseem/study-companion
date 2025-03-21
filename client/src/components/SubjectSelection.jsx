import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Select, Button, Typography, Alert, Spin } from 'antd';
import api from '../api/config';
import './SubjectSelection.css';

const { Title } = Typography;
const { Option } = Select;

function SubjectSelection() {
  const navigate = useNavigate();
  const { subject } = useParams(); // Get subject from URL params
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(subject || 'computer-science');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [subjects, setSubjects] = useState([]);

  // Fetch available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/curriculum/subjects');
        console.log('Subjects response:', response.data);
        if (response.data && Array.isArray(response.data)) {
          setSubjects(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        setError('Failed to load subjects. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch curriculum data for selected subject
  useEffect(() => {
    const fetchCurriculum = async () => {
      if (!selectedSubject) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching curriculum for:', selectedSubject);
        const response = await api.get(`/curriculum/o-level/${selectedSubject}`);
        console.log('Curriculum data:', response.data);
        if (response.data && response.data.topics) {
          setCurriculum(response.data);
          setSelectedTopic('');
          setSelectedSubtopic('');
        } else {
          throw new Error('Invalid curriculum data format');
        }
      } catch (err) {
        console.error(`Failed to fetch curriculum for ${selectedSubject}:`, err);
        setError(`Failed to fetch curriculum data for ${selectedSubject}. Please try refreshing the page.`);
        setCurriculum(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurriculum();
  }, [selectedSubject]);

  const handleSubjectChange = (subject) => {
    console.log('Subject changed to:', subject);
    setSelectedSubject(subject);
  };

  const handleTopicChange = (topicName) => {
    console.log('Topic changed to:', topicName);
    setSelectedTopic(topicName);
    setSelectedSubtopic('');
  };

  const handleSubtopicChange = (subtopicName) => {
    console.log('Subtopic changed to:', subtopicName);
    setSelectedSubtopic(subtopicName);
  };

  const handleStartQuiz = () => {
    if (!selectedTopic || !selectedSubtopic) {
      setError('Please select both a topic and subtopic');
      return;
    }

    try {
      // Find the selected topic object
      const topic = curriculum.topics.find(t => t.name === selectedTopic);
      if (!topic) {
        throw new Error('Selected topic not found');
      }

      // Find the selected subtopic index
      const subtopicIndex = topic.subtopics.findIndex(st => st.name === selectedSubtopic);
      if (subtopicIndex === -1) {
        throw new Error('Selected subtopic not found');
      }

      // Navigate to the quiz with encoded parameters
      const encodedSubject = encodeURIComponent(selectedSubject);
      const encodedTopic = encodeURIComponent(selectedTopic);
      navigate(`/quiz/${encodedSubject}/${encodedTopic}/${subtopicIndex}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setError(error.message);
    }
  };

  if (loading && !curriculum && subjects.length === 0) {
    return (
      <div className="subject-selection-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spin size="large" />
            <p style={{ marginTop: '1rem' }}>Loading subjects...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="subject-selection-container">
      <Card className="selection-card">
        <Title level={2}>Start a Quiz</Title>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <div className="selection-form">
          <div className="form-item">
            <label>Select Subject:</label>
            <Select
              style={{ width: '100%' }}
              value={selectedSubject}
              onChange={handleSubjectChange}
              loading={loading && subjects.length === 0}
            >
              {subjects.map(subject => (
                <Option key={subject.urlFriendlySubject} value={subject.urlFriendlySubject}>
                  {subject.subject}
                </Option>
              ))}
            </Select>
          </div>

          <div className="form-item">
            <label>Select Topic:</label>
            <Select
              style={{ width: '100%' }}
              value={selectedTopic}
              onChange={handleTopicChange}
              placeholder="Choose a topic"
              loading={loading && selectedSubject}
              disabled={!curriculum || loading}
            >
              {curriculum?.topics?.map(topic => (
                <Option key={topic.name} value={topic.name}>{topic.name}</Option>
              ))}
            </Select>
          </div>

          {selectedTopic && (
            <div className="form-item">
              <label>Select Subtopic:</label>
              <Select
                style={{ width: '100%' }}
                value={selectedSubtopic}
                onChange={handleSubtopicChange}
                placeholder="Choose a subtopic"
                disabled={!selectedTopic || loading}
              >
                {curriculum?.topics
                  .find(t => t.name === selectedTopic)
                  ?.subtopics.map(subtopic => (
                    <Option key={subtopic.name} value={subtopic.name}>
                      {subtopic.name}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          <Button
            type="primary"
            onClick={handleStartQuiz}
            disabled={!selectedTopic || !selectedSubtopic || loading}
            loading={loading}
            block
            size="large"
            style={{ marginTop: '1rem' }}
          >
            Start Quiz
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SubjectSelection;
