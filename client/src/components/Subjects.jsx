import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Collapse, Space, Modal, Spin } from 'antd';
import { CodeOutlined, BookOutlined, LineChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import './Subjects.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const iconMap = {
  'Computer Science': <CodeOutlined />,
  'Pakistan Studies - History': <BookOutlined />,
  'Pakistan Studies - Geography': <BookOutlined />,
  'Economics': <LineChartOutlined />
};

const colorMap = {
  'Computer Science': '#1890ff',
  'Pakistan Studies - History': '#52c41a',
  'Pakistan Studies - Geography': '#52c41a',
  'Economics': '#722ed1'
};

function Subjects() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [curriculumMap, setCurriculumMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First fetch all available subjects
        console.log('Fetching subjects...');
        const subjectsResponse = await api.get('/curriculum/subjects');
        console.log('Subjects response:', subjectsResponse.data);
        
        if (!subjectsResponse.data || !Array.isArray(subjectsResponse.data)) {
          throw new Error('Invalid subjects data format');
        }
        
        const availableSubjects = subjectsResponse.data;
        setSubjects(availableSubjects);

        // Then fetch curriculum for each subject
        const curriculumData = {};
        for (const subject of availableSubjects) {
          try {
            console.log(`Fetching curriculum for ${subject.subject} (${subject.urlFriendlySubject})`);
            const response = await api.get(`/curriculum/o-level/${subject.urlFriendlySubject}`);
            curriculumData[subject.subject] = response.data;
          } catch (err) {
            console.error(`Failed to fetch curriculum for ${subject.subject}:`, err);
          }
        }
        
        setCurriculumMap(curriculumData);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        setError('Failed to fetch subject data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleStudyModeSelect = (mode, subject) => {
    // Find the urlFriendlySubject for the selected subject
    const selectedSubjectObj = subjects.find(s => s.subject === subject);
    
    if (!selectedSubjectObj) {
      console.error(`Subject not found: ${subject}`);
      return;
    }
    
    const urlFriendlySubject = selectedSubjectObj.urlFriendlySubject;
    
    if (mode === 'quiz') {
      // Navigate to subject selection page instead of directly to quiz
      navigate(`/subject-selection/${urlFriendlySubject}`);
    } else if (mode === 'flashcards') {
      navigate(`/flashcards/${urlFriendlySubject}`);
    }
    
    setSelectedSubject(null);
  };

  if (loading) {
    return (
      <div className="subjects-container">
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Spin size="large" />
            <Text>Loading subjects...</Text>
          </Space>
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
        {subjects.map((subject) => (
          <Card
            key={subject.subject}
            hoverable
            className="subject-card"
            style={{ borderTop: `2px solid ${colorMap[subject.subject] || '#1890ff'}` }}
            onClick={() => handleSubjectClick(subject.subject)}
          >
            {iconMap[subject.subject] || <BookOutlined />}
            <Title level={4}>{subject.subject}</Title>
            <Text>O Level {subject.subject}</Text>
            <div className="key-topics">
              <Text strong>Key Topics:</Text>
              <List
                size="small"
                dataSource={curriculumMap[subject.subject]?.topics?.map(t => t.name) || []}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Choose Study Mode"
        open={!!selectedSubject}
        onCancel={() => setSelectedSubject(null)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block type="primary" onClick={() => handleStudyModeSelect('quiz', selectedSubject)}>
            Take a Quiz
          </Button>
          <Button block onClick={() => handleStudyModeSelect('flashcards', selectedSubject)}>
            Study with Flashcards
          </Button>
        </Space>
      </Modal>
    </div>
  );
}

export default Subjects;
