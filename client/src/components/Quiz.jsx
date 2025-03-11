import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, Typography, Space, Alert, Progress } from 'antd';
import { subjects } from '../data/subjects';
import api from '../api/config';
import './Quiz.css';

const { Title, Text } = Typography;

function Quiz() {
  const { subjectId, topicId, subtopicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Get subject and topic details
  const subject = subjects.find(s => s.id === subjectId);
  const topic = subject?.topics.find(t => t.id === topicId);
  const subtopicIndex = parseInt(subtopicId);
  const subtopic = topic?.subtopics[subtopicIndex];

  useEffect(() => {
    if (!subject || !topic || !subtopic) {
      setError('Invalid quiz parameters');
      setLoading(false);
      return;
    }

    generateQuiz();
  }, [subject, topic, subtopic]);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Generating quiz with:', {
        subject: subject.name,
        topic: topic.name,
        subtopic
      });

      const response = await api.post('/quiz/generate', {
        subject: subject.name,
        topic: topic.name,
        subtopic
      });

      setQuestions(response.data.questions);
      setLoading(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error.response?.data?.details || 'Failed to generate quiz questions');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (value) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    // Calculate score for current question
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    if (currentQuestion.type === 'multiple_choice') {
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'true_false') {
      isCorrect = selectedAnswer === currentQuestion.isTrue;
    }

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleCheckAnswer = () => {
    setShowExplanation(true);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    generateQuiz();
  };

  const handleBackToSubjects = () => {
    navigate('/quiz');
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Title level={3}>Generating Quiz...</Title>
            <Progress percent={30} status="active" />
          </Space>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Space>
              <Button type="primary" onClick={generateQuiz}>
                Try Again
              </Button>
              <Button onClick={handleBackToSubjects}>
                Back to Quiz Selection
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="quiz-container">
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Title level={2}>Quiz Completed!</Title>
            <Title level={3}>Your Score: {score}/{questions.length}</Title>
            <Progress type="circle" percent={percentage} />
            <Space>
              <Button type="primary" onClick={handleRestartQuiz}>
                Take Another Quiz
              </Button>
              <Button onClick={handleBackToSubjects}>
                Back to Quiz Selection
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <Alert
          message="No Questions"
          description="No questions available for this topic."
          type="warning"
          showIcon
          action={
            <Button onClick={handleBackToSubjects}>
              Back to Quiz Selection
            </Button>
          }
        />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className="quiz-header">
            <Title level={3}>{subject.name} Quiz</Title>
            <Text type="secondary">
              Topic: {topic.name} - {subtopic}
            </Text>
            <Progress 
              percent={((currentQuestionIndex + 1) / questions.length) * 100} 
              status="active"
              style={{ marginBottom: 20 }}
            />
          </div>

          <div className="question-content">
            {currentQuestion.type === 'multiple_choice' && (
              <>
                <Title level={4}>Question {currentQuestionIndex + 1}</Title>
                <Text>{currentQuestion.question}</Text>
                <Radio.Group 
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  value={selectedAnswer}
                  style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {currentQuestion.options.map((option, index) => (
                    <Radio key={index} value={index}>
                      {option}
                    </Radio>
                  ))}
                </Radio.Group>
              </>
            )}

            {currentQuestion.type === 'true_false' && (
              <>
                <Title level={4}>Question {currentQuestionIndex + 1}</Title>
                <Text>{currentQuestion.statement}</Text>
                <Radio.Group
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  value={selectedAnswer}
                  style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <Radio value={true}>True</Radio>
                  <Radio value={false}>False</Radio>
                </Radio.Group>
              </>
            )}

            {currentQuestion.type === 'short_answer' && (
              <>
                <Title level={4}>Question {currentQuestionIndex + 1}</Title>
                <Text>{currentQuestion.question}</Text>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Key points to include in your answer:</Text>
                  <ul>
                    {currentQuestion.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {showExplanation && (
              <Alert
                message="Explanation"
                description={currentQuestion.explanation}
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </div>

          <div className="question-actions">
            <Space>
              {!showExplanation && (
                <Button type="primary" onClick={handleCheckAnswer}>
                  Check Answer
                </Button>
              )}
              {showExplanation && (
                <Button type="primary" onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              )}
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default Quiz;
