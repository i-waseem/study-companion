import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Select, Button, Typography, Alert, Spin } from 'antd';
import api from '../api/config';
import './FlashcardSelection.css';

const { Title } = Typography;
const { Option } = Select;

function FlashcardSelection() {
  const navigate = useNavigate();
  const { subject } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(subject || '');

  // Fetch available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/curriculum/subjects');
        if (response.data && Array.isArray(response.data)) {
          setSubjects(response.data);
          // If subject is not provided in URL and we have subjects, select the first one
          if (!subject && response.data.length > 0) {
            setSelectedSubject(response.data[0].urlFriendlySubject);
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        setError('Failed to load subjects. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [subject]);

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  const handleStartStudying = () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    navigate(`/flashcards/${selectedSubject}`);
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="flashcard-selection-container">
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
    <div className="flashcard-selection-container">
      <Card className="selection-card">
        <Title level={2}>Study with Flashcards</Title>

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
              loading={loading}
            >
              {subjects.map(subject => (
                <Option key={subject.urlFriendlySubject} value={subject.urlFriendlySubject}>
                  {subject.subject}
                </Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            onClick={handleStartStudying}
            disabled={!selectedSubject}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Start Studying
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default FlashcardSelection;
