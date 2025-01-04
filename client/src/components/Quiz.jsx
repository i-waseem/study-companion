import { useState, useEffect } from 'react';
import './Quiz.css';

const sampleQuizzes = [
  {
    id: 1,
    title: 'Data Structures Fundamentals',
    description: 'Test your knowledge of basic data structures',
    questions: [
      {
        id: 1,
        question: 'What is the time complexity of searching in a balanced binary search tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'Which data structure uses LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Array'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 2,
    title: 'Algorithm Analysis',
    description: 'Challenge yourself with algorithm complexity questions',
    questions: [
      {
        id: 1,
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        correctAnswer: 1
      }
    ]
  }
];

function Quiz() {
  const [quizzes, setQuizzes] = useState(sampleQuizzes);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setAnswers(new Array(quiz.questions.length).fill(null));
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (answerIndex === currentQuiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < currentQuiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setAnswers([]);
  };

  return (
    <div className="quiz-container">
      {!currentQuiz ? (
        <>
          <h2>Available Quizzes</h2>
          <div className="quiz-list">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>
                <p className="questions-count">{quiz.questions.length} questions</p>
                <button onClick={() => startQuiz(quiz)}>Start Quiz</button>
              </div>
            ))}
          </div>
        </>
      ) : showResults ? (
        <div className="quiz-results">
          <h2>Quiz Results</h2>
          <div className="score-card">
            <h3>Your Score</h3>
            <div className="score">
              {score} / {currentQuiz.questions.length}
            </div>
            <p className="percentage">
              {Math.round((score / currentQuiz.questions.length) * 100)}%
            </p>
          </div>
          <button onClick={resetQuiz}>Back to Quizzes</button>
        </div>
      ) : (
        <div className="quiz-question">
          <h2>{currentQuiz.title}</h2>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="question-count">
            Question {currentQuestion + 1} of {currentQuiz.questions.length}
          </p>
          <h3>{currentQuiz.questions[currentQuestion].question}</h3>
          <div className="options">
            {currentQuiz.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="option-button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
