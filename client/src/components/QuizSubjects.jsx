import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, RightOutlined } from '@ant-design/icons';
import api from '../api/config';
import './QuizSubjects.css';

const { Title, Text } = Typography;

const subjectIcons = {
  'Mathematics': '📐',
  'Physics': '⚡',
  'Chemistry': '🧪',
  'Biology': '🧬',
  'English': '📚',
  'Computer Science': '💻',
  'History': '🏛️',
  'Geography': '🌍',
  'Economics': '📊',
  'Business Studies': '💼'
};

function QuizSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/curriculum/subjects');
        setSubjects(response.data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectClick = (subject) => {
    navigate(`/quiz-selection/${subject.urlFriendlySubject}`);
  };

  if (loading) {
    return (
      <div className="quiz-subjects-loading">
        <Spin size="large" />
        <Text>Loading subjects...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-subjects-error">
        <Empty
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="quiz-subjects-container">
      <div className="quiz-subjects-header">
        <Title level={2}>Choose a Subject for Your Quiz</Title>
        <Text type="secondary">Select a subject to start practicing with AI-generated questions</Text>
      </div>

      <Row gutter={[24, 24]} className="quiz-subjects-grid">
        {subjects.map((subject) => (
          <Col xs={24} sm={12} md={8} lg={6} key={subject.urlFriendlySubject}>
            <Card
              hoverable
              className="quiz-subject-card"
              onClick={() => handleSubjectClick(subject)}
            >
              <div className="subject-icon">
                {subjectIcons[subject.subject] || '📚'}
              </div>
              <div className="subject-info">
                <Title level={4}>{subject.subject}</Title>
                <Button type="link" className="start-button">
                  Start Quiz <RightOutlined />
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default QuizSubjects;
