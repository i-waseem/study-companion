import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, Typography, Space, Alert, Progress, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
  const [isCorrect, setIsCorrect] = useState(null);

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
    setIsCorrect(null); // Reset correctness when new answer is selected
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
    let correct = false;

    if (currentQuestion.type === 'multiple_choice') {
      correct = selectedAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'true_false') {
      correct = selectedAnswer === currentQuestion.correctAnswer;
    }

    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setIsCorrect(null);
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
    const status = percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'error';
    const message = percentage >= 70 ? 'Great job!' : percentage >= 50 ? 'Good effort!' : 'Keep practicing!';
    
    return (
      <div className="quiz-container">
        <Card>
          <Result
            status={status}
            title={message}
            subTitle={`You scored ${score} out of ${questions.length} questions (${percentage.toFixed(1)}%)`}
            extra={[
              <Button type="primary" key="restart" onClick={handleRestartQuiz}>
                Take Another Quiz
              </Button>,
              <Button key="back" onClick={handleBackToSubjects}>
                Back to Quiz Selection
              </Button>
            ]}
          >
            <div className="score-details">
              <Progress type="circle" percent={percentage} status={status} />
              <div className="score-breakdown">
                <Text>Correct Answers: {score}</Text>
                <Text>Incorrect Answers: {questions.length - score}</Text>
                <Text>Total Questions: {questions.length}</Text>
              </div>
            </div>
          </Result>
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
            <Text>Question {currentQuestionIndex + 1} of {questions.length}</Text>
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
              <div className="answer-feedback">
                <Alert
                  message={isCorrect ? "Correct!" : "Incorrect"}
                  description={currentQuestion.explanation}
                  type={isCorrect ? "success" : "error"}
                  showIcon
                  icon={isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  style={{ marginTop: 16 }}
                />
                {!isCorrect && currentQuestion.type !== 'short_answer' && (
                  <div className="correct-answer" style={{ marginTop: 8 }}>
                    <Text strong>
                      Correct answer: {
                        currentQuestion.type === 'multiple_choice' 
                          ? currentQuestion.options[currentQuestion.correctAnswer]
                          : currentQuestion.correctAnswer ? 'True' : 'False'
                      }
                    </Text>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="question-actions">
            <Space>
              {!showExplanation && (
                <Button 
                  type="primary" 
                  onClick={handleCheckAnswer}
                  disabled={selectedAnswer === null && currentQuestion.type !== 'short_answer'}
                >
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
