import React, { useState } from 'react';
import './CareerGuidance.css';
import { getGeminiResponse, generateCareerGuidancePrompt } from '../utils/gemini';

function CareerGuidance() {
  const [step, setStep] = useState('assessment');
  const [answers, setAnswers] = useState({
    interests: [],
    skills: [],
    subjects: [],
    workStyle: '',
    values: []
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const questions = {
    interests: {
      title: "What interests you the most?",
      options: [
        "Problem Solving",
        "Creative Work",
        "Helping Others",
        "Technology",
        "Business",
        "Science",
        "Mathematics",
        "Communication",
        "Design",
        "Research"
      ],
      multiple: true
    },
    skills: {
      title: "What are your strongest skills?",
      options: [
        "Critical Thinking",
        "Programming",
        "Writing",
        "Public Speaking",
        "Analysis",
        "Organization",
        "Leadership",
        "Creativity",
        "Technical Skills",
        "Teamwork"
      ],
      multiple: true
    },
    subjects: {
      title: "Which subjects do you enjoy?",
      options: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
        "Literature",
        "Economics",
        "Art",
        "Psychology",
        "Business Studies"
      ],
      multiple: true
    },
    workStyle: {
      title: "What's your preferred work style?",
      options: [
        "Independent Work",
        "Team Collaboration",
        "Structured Environment",
        "Flexible/Creative Environment"
      ],
      multiple: false
    },
    values: {
      title: "What do you value most in a career?",
      options: [
        "Innovation",
        "Helping Society",
        "Financial Security",
        "Work-Life Balance",
        "Continuous Learning",
        "Leadership Opportunities"
      ],
      multiple: true
    }
  };

  const careerPaths = {
    tech: {
      title: "Technology & Software Development",
      matches: ["Problem Solving", "Technology", "Programming", "Computer Science"],
      careers: [
        {
          role: "Software Developer",
          description: "Build applications and systems using programming languages and tools.",
          skills: ["Programming", "Problem Solving", "Technical Skills"],
          education: ["Computer Science Degree", "Coding Bootcamps", "Online Certifications"],
          resources: [
            { title: "Learn to Code", type: "Course", link: "#" },
            { title: "Software Architecture", type: "Guide", link: "#" }
          ]
        },
        {
          role: "Data Scientist",
          description: "Analyze complex data to help organizations make better decisions.",
          skills: ["Mathematics", "Programming", "Analysis"],
          education: ["Mathematics/Statistics Degree", "Data Science Certifications"],
          resources: [
            { title: "Data Science Fundamentals", type: "Course", link: "#" },
            { title: "Machine Learning Basics", type: "Guide", link: "#" }
          ]
        }
      ]
    },
    science: {
      title: "Science & Research",
      matches: ["Science", "Research", "Analysis", "Critical Thinking"],
      careers: [
        {
          role: "Research Scientist",
          description: "Conduct research to advance knowledge in scientific fields.",
          skills: ["Research", "Analysis", "Critical Thinking"],
          education: ["PhD in Science Field", "Masters Degree"],
          resources: [
            { title: "Research Methodologies", type: "Course", link: "#" },
            { title: "Scientific Writing", type: "Guide", link: "#" }
          ]
        }
      ]
    },
    business: {
      title: "Business & Management",
      matches: ["Business", "Leadership", "Communication", "Economics"],
      careers: [
        {
          role: "Business Analyst",
          description: "Analyze business problems and propose solutions.",
          skills: ["Analysis", "Communication", "Problem Solving"],
          education: ["Business Degree", "MBA", "Professional Certifications"],
          resources: [
            { title: "Business Analysis", type: "Course", link: "#" },
            { title: "Project Management", type: "Guide", link: "#" }
          ]
        }
      ]
    }
  };

  const handleOptionSelect = (category, option) => {
    setAnswers(prev => {
      if (questions[category].multiple) {
        const updated = prev[category].includes(option)
          ? prev[category].filter(item => item !== option)
          : [...prev[category], option];
        return { ...prev, [category]: updated };
      }
      return { ...prev, [category]: option };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Generate AI response using Gemini
      const prompt = generateCareerGuidancePrompt(answers);
      const aiResponse = await getGeminiResponse(prompt);
      
      setResult({
        aiRecommendation: aiResponse,
        // Keep the existing career paths as fallback
        careers: careerPaths[Object.keys(careerPaths)[0]].careers
      });
      
      setStep('result');
    } catch (err) {
      setError('Failed to get AI recommendations. Please try again.');
      console.error('Error getting career guidance:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseAIResponse = (response) => {
    // Split the response into sections based on numbers (1., 2., 3., etc.)
    const sections = response.split(/(?=\d\.)/);
    
    return {
      careerPaths: sections.filter(section => 
        section.toLowerCase().includes('career path') || 
        section.toLowerCase().includes('recommended career')
      ).map(path => {
        const [title, ...details] = path.split('\n').filter(Boolean);
        return {
          title: title.replace(/^\d\.\s*/, '').trim(),
          details: details.map(detail => detail.trim())
        };
      }),
      skillDevelopment: sections.find(section => 
        section.toLowerCase().includes('skill development')
      )?.split('\n').filter(Boolean).slice(1) || [],
      nextSteps: sections.find(section => 
        section.toLowerCase().includes('next steps')
      )?.split('\n').filter(Boolean).slice(1) || []
    };
  };

  if (step === 'result' && result) {
    const parsedResponse = parseAIResponse(result.aiRecommendation);
    
    return (
      <div className="career-guidance">
        <h1>Your Career Recommendation</h1>
        
        <div className="ai-recommendation">
          <div className="recommended-careers">
            <h2>Recommended Career Paths</h2>
            {parsedResponse.careerPaths.map((path, index) => (
              <div key={index} className="ai-career-path">
                <h3>{path.title}</h3>
                <div className="career-details">
                  {path.details.map((detail, i) => {
                    if (detail.includes(':')) {
                      const [label, value] = detail.split(':');
                      return (
                        <div key={i} className="detail-item">
                          <span className="detail-label">{label.trim()}:</span>
                          <span className="detail-value">{value.trim()}</span>
                        </div>
                      );
                    }
                    return <p key={i}>{detail}</p>;
                  })}
                </div>
              </div>
            ))}
          </div>

          {parsedResponse.skillDevelopment.length > 0 && (
            <div className="skill-development">
              <h2>Skill Development Plan</h2>
              <ul className="skill-list">
                {parsedResponse.skillDevelopment.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedResponse.nextSteps.length > 0 && (
            <div className="next-steps">
              <h2>Recommended Next Steps</h2>
              <div className="steps-timeline">
                {parsedResponse.nextSteps.map((step, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-number">{index + 1}</div>
                    <div className="timeline-content">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="additional-resources">
          <h2>Additional Career Resources</h2>
          {result.careers.map((career, index) => (
            <div key={index} className="career-card">
              <h3>{career.role}</h3>
              <p className="description">{career.description}</p>
              
              <div className="career-details">
                <div className="skills">
                  <h4>Key Skills</h4>
                  <div className="skill-tags">
                    {career.skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="education">
                  <h4>Education Path</h4>
                  <ul>
                    {career.education.map((edu, i) => (
                      <li key={i}>{edu}</li>
                    ))}
                  </ul>
                </div>

                <div className="resources">
                  <h4>Learning Resources</h4>
                  {career.resources.map((resource, i) => (
                    <a key={i} href={resource.link} className="resource-link">
                      <span className="resource-type">{resource.type}</span>
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="restart-btn" onClick={() => {
          setStep('assessment');
          setAnswers({
            interests: [],
            skills: [],
            subjects: [],
            workStyle: '',
            values: []
          });
          setResult(null);
        }}>
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="career-guidance">
      <h1>Career Guidance Assessment</h1>
      <p className="intro-text">
        Let's help you find the perfect career path based on your interests and skills.
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="assessment-form">
        {Object.entries(questions).map(([category, question]) => (
          <div key={category} className="question-section">
            <h3>{question.title}</h3>
            <div className="options-grid">
              {question.options.map((option) => (
                <button
                  key={option}
                  className={`option-btn ${
                    question.multiple
                      ? answers[category].includes(option) ? 'selected' : ''
                      : answers[category] === option ? 'selected' : ''
                  }`}
                  onClick={() => handleOptionSelect(category, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          className={`submit-btn ${loading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading || Object.values(answers).every(val => 
            Array.isArray(val) ? val.length === 0 : !val
          )}
        >
          {loading ? 'Getting AI Recommendations...' : 'Get Career Recommendations'}
        </button>
      </div>
    </div>
  );
}

export default CareerGuidance;
