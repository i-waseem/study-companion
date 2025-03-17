import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, Typography, Space, Alert, Progress, Result, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../api/config';
import './Quiz.css';

const { Title, Text } = Typography;

function Quiz() {
  const navigate = useNavigate();
  const { subjectId, topicId, subtopicId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const generateQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get curriculum data for the selected topic
        const curriculumResponse = await api.get(`/curriculum/o-level/${subjectId}`);
        if (!curriculumResponse.data || !curriculumResponse.data.topics) {
          throw new Error('Invalid curriculum data');
        }

        const selectedTopic = curriculumResponse.data.topics.find(t => t.name === decodeURIComponent(topicId));
        if (!selectedTopic) {
          throw new Error('Selected topic not found');
        }

        const selectedSubtopic = selectedTopic.subtopics[parseInt(subtopicId)];
        if (!selectedSubtopic) {
          throw new Error('Selected subtopic not found');
        }

        console.log('Generating quiz with:', {
          subject: decodeURIComponent(subjectId),
          topic: selectedTopic.name,
          subtopic: selectedSubtopic.name,
          learningObjectives: selectedSubtopic.learningObjectives
        });

        const response = await api.post('/quiz/generate', {
          subject: decodeURIComponent(subjectId),
          topic: selectedTopic.name,
          subtopic: selectedSubtopic.name,
          learningObjectives: selectedSubtopic.learningObjectives
        });

        if (!response.data || !response.data.questions) {
          throw new Error('Invalid quiz data received');
        }

        setQuestions(response.data.questions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setQuizCompleted(false);
        setIsCorrect(null);
      } catch (error) {
        console.error('Error generating quiz:', error);
        setError(error.response?.data?.message || error.message || 'Failed to generate quiz');
      } finally {
        setLoading(false);
      }
    };

    generateQuiz();
  }, [subjectId, topicId, subtopicId]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleCheckAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleTryAgain = () => {
    navigate('/quiz');
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Spin size="large" />
            <Text>Generating your quiz...</Text>
          </Space>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <Card>
          <Result
            status="error"
            title="Failed to generate quiz"
            subTitle={error}
            extra={[
              <Button key="tryAgain" onClick={handleTryAgain}>
                Try Again
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="quiz-container">
        <Card>
          <Result
            status={percentage >= 70 ? "success" : "warning"}
            title={`Quiz Completed! Score: ${percentage.toFixed(1)}%`}
            subTitle={`You got ${score} out of ${questions.length} questions correct`}
            extra={[
              <Button key="tryAgain" type="primary" onClick={handleTryAgain}>
                Take Another Quiz
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className="quiz-header">
            <Progress 
              percent={((currentQuestionIndex + 1) / questions.length) * 100} 
              format={() => `${currentQuestionIndex + 1}/${questions.length}`}
            />
          </div>

          <div className="question-section">
            <Title level={4}>{currentQuestion.question}</Title>
            <Radio.Group
              onChange={(e) => handleAnswerSelect(e.target.value)}
              value={selectedAnswer}
              disabled={showExplanation}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentQuestion.options.map((option, index) => (
                  <Radio key={index} value={option} className="quiz-option">
                    {option}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {showExplanation && (
            <Alert
              message={isCorrect ? "Correct!" : "Incorrect"}
              description={currentQuestion.explanation}
              type={isCorrect ? "success" : "error"}
              showIcon
              icon={isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            />
          )}

          <div className="quiz-actions">
            {!showExplanation ? (
              <Button
                type="primary"
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                block
              >
                Check Answer
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleNextQuestion}
                block
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            )}
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default Quiz;
