import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Select, Button, Typography, Alert, Spin } from 'antd';
import api from '../api/config';
import './SubjectSelection.css';

const { Title } = Typography;
const { Option } = Select;

// Helper function to convert subject name to URL-friendly format
const toUrlFriendly = (subject) => {
  if (!subject) return '';
  return subject.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// Helper function to convert URL-friendly format back to display format
const fromUrlFriendly = (urlSubject) => {
  if (!urlSubject) return '';
  return urlSubject
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function SubjectSelection() {
  const navigate = useNavigate();
  const { subject } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(subject || '');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [subjects, setSubjects] = useState([]);

  // Fetch available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        console.log('Fetching subjects...');
        const response = await api.get('/api/curriculum/subjects');
        console.log('Subjects API response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setSubjects(response.data);
          
          // If no subject is selected and we have subjects, select the first one
          if (!selectedSubject && response.data.length > 0) {
            const firstSubject = response.data[0].urlFriendlySubject;
            console.log('Auto-selecting first subject:', firstSubject);
            setSelectedSubject(firstSubject);
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err.response || err);
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
      if (!selectedSubject) {
        console.log('No subject selected, skipping curriculum fetch');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching curriculum for subject:', selectedSubject);
        const response = await api.get(`/api/curriculum/o-level/${selectedSubject}`);
        console.log('Curriculum API response:', response.data);
        
        if (response.data && response.data.topics) {
          console.log('Setting curriculum with topics:', response.data.topics.map(t => t.name));
          setCurriculum(response.data);
        } else {
          console.error('Invalid curriculum data:', response.data);
          setError('Received invalid curriculum data');
        }
      } catch (err) {
        console.error('Failed to fetch curriculum:', err.response || err);
        setError(`Failed to fetch curriculum for ${selectedSubject}`);
        setCurriculum(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [selectedSubject]);

  // Handle subject change
  const handleSubjectChange = (value) => {
    console.log('Selected subject changed to:', value);
    setSelectedSubject(value);
    setSelectedTopic('');
    setSelectedSubtopic('');
  };

  // Helper function to check if curriculum matches subject
  const doesCurriculumMatchSubject = (curriculumData, subjectData) => {
    if (!curriculumData || !subjectData) return false;
    
    // Try different formats of subject names
    const currSubject = curriculumData.subject.toLowerCase();
    const dataSubject = subjectData.subject.toLowerCase();
    
    // Check if the subjects match in any format
    return currSubject === dataSubject || 
           currSubject === `pakistan studies - ${dataSubject.replace('pakistan studies - ', '')}` ||
           dataSubject === `pakistan studies - ${currSubject.replace('pakistan studies - ', '')}` ||
           currSubject.includes(dataSubject) ||
           dataSubject.includes(currSubject);
  };

  // Helper function to get display name for subject
  const getDisplayName = (subject) => {
    if (!subject) return '';
    return subject; // Return the full subject name as it comes from the server
  };

  return (
    <div className="subject-selection">
      <Title level={2}>O Level Subjects</Title>
      <p className="subtitle">Select a subject to begin studying.</p>

      {error && <Alert message={error} type="error" className="error-alert" />}

      <div className="subjects-grid">
        {subjects.map((subjectData) => {
          const isSelected = selectedSubject === subjectData.urlFriendlySubject;
          const curriculumForSubject = curriculum && doesCurriculumMatchSubject(curriculum, subjectData) ? curriculum : null;
          
          return (
            <Card
              key={subjectData.urlFriendlySubject}
              className={`subject-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSubjectChange(subjectData.urlFriendlySubject)}
            >
              <Title level={4}>{getDisplayName(subjectData.subject)}</Title>
              {curriculumForSubject && (
                <div className="subject-details">
                  <Title level={5}>Key Topics:</Title>
                  <ul>
                    {curriculumForSubject.topics.map(topic => (
                      <li key={topic.name}>{topic.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {loading && isSelected && (
                <div className="loading-overlay">
                  <Spin />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SubjectSelection;
