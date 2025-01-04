import React, { useState } from 'react';
import './Subjects.css';

function Subjects() {
  const [activeGrade, setActiveGrade] = useState('primary');

  const gradeCategories = {
    primary: {
      label: 'Primary (Grade 1-5)',
      subjects: [
        {
          id: 1,
          name: 'Mathematics',
          progress: 75,
          topics: ['Numbers', 'Basic Algebra', 'Geometry', 'Fractions']
        },
        {
          id: 2,
          name: 'Science',
          progress: 60,
          topics: ['Living Things', 'Matter', 'Energy', 'Earth and Space']
        },
        {
          id: 3,
          name: 'English',
          progress: 85,
          topics: ['Grammar', 'Reading', 'Writing', 'Vocabulary']
        }
      ]
    },
    middle: {
      label: 'Middle School (Grade 6-8)',
      subjects: [
        {
          id: 4,
          name: 'Mathematics',
          progress: 70,
          topics: ['Algebra', 'Geometry', 'Statistics', 'Ratios']
        },
        {
          id: 5,
          name: 'Science',
          progress: 65,
          topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science']
        },
        {
          id: 6,
          name: 'Computer Science',
          progress: 80,
          topics: ['Basic Programming', 'Web Design', 'Digital Skills']
        }
      ]
    },
    olevel: {
      label: 'O Level',
      subjects: [
        {
          id: 7,
          name: 'Mathematics',
          progress: 55,
          topics: ['Functions', 'Trigonometry', 'Vectors', 'Probability']
        },
        {
          id: 8,
          name: 'Physics',
          progress: 60,
          topics: ['Mechanics', 'Waves', 'Electricity', 'Nuclear Physics']
        },
        {
          id: 9,
          name: 'Computer Science',
          progress: 75,
          topics: ['Programming', 'Databases', 'Networks', 'System Architecture']
        }
      ]
    },
    alevel: {
      label: 'A Level',
      subjects: [
        {
          id: 10,
          name: 'Mathematics',
          progress: 45,
          topics: ['Pure Mathematics', 'Statistics', 'Mechanics']
        },
        {
          id: 11,
          name: 'Physics',
          progress: 50,
          topics: ['Fields', 'Quantum Physics', 'Thermodynamics']
        },
        {
          id: 12,
          name: 'Computer Science',
          progress: 65,
          topics: ['Data Structures', 'Algorithms', 'Object-Oriented Programming']
        }
      ]
    }
  };

  return (
    <div className="subjects">
      <h1>My Subjects</h1>
      
      <div className="grade-tabs">
        {Object.entries(gradeCategories).map(([key, value]) => (
          <button
            key={key}
            className={`grade-tab ${activeGrade === key ? 'active' : ''}`}
            onClick={() => setActiveGrade(key)}
          >
            {value.label}
          </button>
        ))}
      </div>

      <div className="subjects-grid">
        {gradeCategories[activeGrade].subjects.map(subject => (
          <div key={subject.id} className="subject-card">
            <h2>{subject.name}</h2>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${subject.progress}%` }}
              />
            </div>
            <p className="progress-text">{subject.progress}% Complete</p>
            <div className="topics">
              <h3>Topics</h3>
              <ul>
                {subject.topics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Subjects;
