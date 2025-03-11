import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Radio, Space, Typography, Progress, Result, Spin, Alert, Input, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { generateQuiz as generateQuizAPI } from '../api/quiz';
import './Quiz.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function Quiz() {
  const navigate = useNavigate();
  const { subject, topic } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);

  // For multiple choice and true/false
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  // For short answer
  const [shortAnswer, setShortAnswer] = useState('');

  useEffect(() => {
    if (subject && topic) {
      generateQuiz();
    }
  }, [subject, topic]);

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await generateQuizAPI(subject, topic);
      
      // Check if we got fallback questions
      if (data.metadata?.isFailback) {
        setError({
          type: 'warning',
          message: 'Using backup questions due to an error.',
          description: data.metadata.error
        });
      }
      
      setQuiz(data);
      resetQuizState();
    } catch (error) {
      setError({
        type: 'error',
        message: 'Failed to generate quiz',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const resetQuizState = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShortAnswer('');
    setShowExplanation(false);
    setAnswers([]);
    setQuizComplete(false);
    setScore(0);
  };

  const handleAnswerSubmit = () => {
    const currentQ = quiz.questions[currentQuestion];
    let isCorrect = false;
    let answer = null;

    switch (currentQ.type) {
      case 'multiple_choice':
        isCorrect = selectedAnswer === currentQ.correctAnswer;
        answer = selectedAnswer;
        break;
      case 'true_false':
        isCorrect = selectedAnswer === (currentQ.isTrue ? 1 : 0);
        answer = selectedAnswer;
        break;
      case 'short_answer':
        answer = shortAnswer;
        // For short answer, we'll check if they've addressed the key points
        const keyPointsAddressed = currentQ.keyPoints.filter(point =>
          shortAnswer.toLowerCase().includes(point.toLowerCase())
        ).length;
        isCorrect = keyPointsAddressed >= (currentQ.keyPoints.length * 0.7); // 70% of key points
        break;
      default:
        console.error('Unknown question type:', currentQ.type);
        return;
    }

    // Update answers and score
    setAnswers([...answers, { 
      questionIndex: currentQuestion,
      answer,
      isCorrect,
      type: currentQ.type
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShortAnswer('');
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const renderDifficultyTag = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'error'
    };
    return (
      <Tag color={colors[difficulty]} style={{ marginBottom: 16 }}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Tag>
    );
  };

  const renderQuestion = () => {
    const question = quiz.questions[currentQuestion];
    
    return (
      <Card className="question-card">
        {renderDifficultyTag(question.difficulty)}
        
        <div className="question-header">
          <Progress 
            percent={((currentQuestion + 1) / quiz.questions.length) * 100} 
            size="small"
            status="active"
          />
          <Text type="secondary">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Text>
        </div>

        {question.type === 'multiple_choice' && (
          <div className="question-content">
            <Title level={4}>{question.question}</Title>
            <Radio.Group 
              onChange={e => setSelectedAnswer(e.target.value)}
              value={selectedAnswer}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {question.options.map((option, index) => (
                  <Radio key={index} value={index} className="quiz-option">
                    {option}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="question-content">
            <Title level={4}>{question.statement}</Title>
            <Radio.Group 
              onChange={e => setSelectedAnswer(e.target.value)}
              value={selectedAnswer}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value={1} className="quiz-option">True</Radio>
                <Radio value={0} className="quiz-option">False</Radio>
              </Space>
            </Radio.Group>
          </div>
        )}

        {question.type === 'short_answer' && (
          <div className="question-content">
            <Title level={4}>{question.question}</Title>
            <TextArea
              value={shortAnswer}
              onChange={e => setShortAnswer(e.target.value)}
              placeholder="Type your answer here..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              className="quiz-short-answer"
            />
            <div className="key-points">
              <Text type="secondary">
                <InfoCircleOutlined /> Your answer should address these key points:
              </Text>
              <ul>
                {question.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="question-actions">
          <Button 
            type="primary" 
            onClick={handleAnswerSubmit}
            disabled={
              (question.type === 'short_answer' && !shortAnswer.trim()) ||
              (question.type !== 'short_answer' && selectedAnswer === null) ||
              showExplanation
            }
          >
            Submit Answer
          </Button>
        </div>
      </Card>
    );
  };

  const renderExplanation = () => {
    const question = quiz.questions[currentQuestion];
    const answer = answers[currentQuestion];

    if (!showExplanation) return null;

    return (
      <div className="explanation-section">
        <Alert
          type={answer.isCorrect ? 'success' : 'error'}
          message={answer.isCorrect ? 'Correct!' : 'Incorrect'}
          description={
            <div>
              <Paragraph>{question.explanation}</Paragraph>
              {question.type === 'short_answer' && (
                <div className="model-answer">
                  <Text strong>Model Answer:</Text>
                  <Paragraph>{question.modelAnswer}</Paragraph>
                </div>
              )}
            </div>
          }
          showIcon
        />
        <Button 
          type="primary" 
          onClick={handleNextQuestion}
          style={{ marginTop: 16 }}
        >
          {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    );
  };

  const renderQuizComplete = () => {
    const finalScore = (score / quiz.questions.length) * 100;
    
    return (
      <Result
        status={finalScore >= 70 ? 'success' : 'warning'}
        title={`Quiz Complete! Score: ${finalScore.toFixed(1)}%`}
        subTitle={
          <div>
            <Text>
              You got {score} out of {quiz.questions.length} questions correct.
            </Text>
            {quiz.metadata && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  Subject: {quiz.metadata.subject} | Topic: {quiz.metadata.topic}
                </Text>
              </div>
            )}
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            key="retry" 
            icon={<ReloadOutlined />}
            onClick={generateQuiz}
          >
            Try Another Quiz
          </Button>,
          <Button 
            key="back" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        ]}
      />
    );
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <Spin size="large" />
        <Text>Generating your quiz...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type={error.type || 'error'}
        message={error.message}
        description={error.description}
        action={
          <Button type="primary" onClick={generateQuiz}>
            Try Again
          </Button>
        }
      />
    );
  }

  if (!quiz) {
    return (
      <Alert
        type="warning"
        message="No quiz available"
        description="Please select a subject and topic to start a quiz."
        action={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        }
      />
    );
  }

  return (
    <div className="quiz-container">
      {quizComplete ? renderQuizComplete() : (
        <>
          {renderQuestion()}
          {renderExplanation()}
        </>
      )}
    </div>
  );
}

export default Quiz;
