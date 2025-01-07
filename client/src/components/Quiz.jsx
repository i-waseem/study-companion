import { useState } from 'react';
import './Quiz.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

function Quiz() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);

  const generateQuiz = async () => {
    if (!selectedSubtopic) return;

    setLoading(true);
    try {
      const prompt = `Create a multiple choice quiz about ${selectedSubtopic} in ${selectedTopic} (${selectedCourse} - ${selectedSubject}). Return ONLY a JSON object in this format, no other text:
{
  "questions": [
    {
      "question": "What is X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}`;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const quizText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonStart = quizText.indexOf('{');
      const jsonEnd = quizText.lastIndexOf('}') + 1;
      const quizData = JSON.parse(quizText.slice(jsonStart, jsonEnd));

      setQuiz(quizData);
      setCurrentQuestion(0);
      setScore(0);
      setShowResults(false);
      setAnswers(new Array(quizData.questions.length).fill(null));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (answerIndex === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setAnswers([]);
  };

  return (
    <div className="quiz-container">
      <div className="quiz-selection">
        <div className="selection-group">
          <label>Subject:</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="">Select Subject</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>

        {selectedSubject && (
          <div className="selection-group">
            <label>Course:</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">Select Course</option>
              <option value="Programming Fundamentals">Programming Fundamentals</option>
              <option value="Data Structures">Data Structures</option>
            </select>
          </div>
        )}

        {selectedCourse && (
          <div className="selection-group">
            <label>Topic:</label>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              <option value="">Select Topic</option>
              <option value="Python Basics">Python Basics</option>
              <option value="Object-Oriented Programming">Object-Oriented Programming</option>
            </select>
          </div>
        )}

        {selectedTopic && (
          <div className="selection-group">
            <label>Subtopic:</label>
            <select value={selectedSubtopic} onChange={(e) => setSelectedSubtopic(e.target.value)}>
              <option value="">Select Subtopic</option>
              <option value="Variables">Variables</option>
              <option value="Control Flow">Control Flow</option>
              <option value="Functions">Functions</option>
            </select>
          </div>
        )}

        {selectedSubtopic && !quiz && (
          <button onClick={generateQuiz} disabled={loading} className="generate-button">
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </button>
        )}
      </div>

      {quiz && !showResults && (
        <div className="quiz-content">
          <h2>Question {currentQuestion + 1} of {quiz.questions.length}</h2>
          <div className="question-card">
            <p className="question">{quiz.questions[currentQuestion].question}</p>
            <div className="options">
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`option-button ${answers[currentQuestion] === index ? 'selected' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div className="quiz-results">
          <h2>Quiz Results</h2>
          <div className="score-card">
            <h3>Your Score</h3>
            <div className="score">
              {score} / {quiz.questions.length}
            </div>
            <div className="score-percentage">
              {Math.round((score / quiz.questions.length) * 100)}%
            </div>
          </div>
          <button onClick={resetQuiz} className="retry-button">
            Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
