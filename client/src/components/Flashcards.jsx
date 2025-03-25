import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import api from '../api/config';
import './Flashcards.css';

function Flashcards() {
  const { subject } = useParams();
  const [decks, setDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch flashcard decks from curriculum
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        console.log('Fetching curriculum for subject:', subject);
        const response = await api.get(`/curriculum/o-level/${subject}`);
        
        // Transform curriculum topics into flashcard decks
        const flashcardDecks = response.data.topics.map(topic => ({
          id: topic.name.toLowerCase().replace(/\s+/g, '-'),
          title: topic.name,
          cards: topic.subtopics.flatMap(subtopic => 
            subtopic.learningObjectives.map((objective, index) => ({
              id: `${topic.name}-${subtopic.name}-${index}`.toLowerCase().replace(/\s+/g, '-'),
              front: generateQuestion(objective),
              back: objective
            }))
          )
        })).filter(deck => deck.cards.length > 0);

        setDecks([{
          subject: response.data.subject,
          decks: flashcardDecks
        }]);
        
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        message.error('Failed to load flashcards');
        setError('Failed to load flashcards. Please try again later.');
        setLoading(false);
      }
    };

    fetchDecks();
  }, [subject]);

  const startStudying = (deck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyMode(true);
  };

  const nextCard = () => {
    if (currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const exitStudyMode = () => {
    setStudyMode(false);
    setCurrentDeck(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Helper function to generate a question from a learning objective
  const generateQuestion = (objective) => {
    // Remove any leading/trailing whitespace and periods
    objective = objective.trim().replace(/\.$/, '');

    // If the objective starts with a question word, return it as is
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which'];
    if (questionWords.some(word => objective.toLowerCase().startsWith(word))) {
      return objective + '?';
    }

    // If the objective starts with "Understand", "Learn", "Know", etc., convert to a question
    const learningVerbs = ['understand', 'learn', 'know', 'describe', 'explain', 'identify', 'list', 'define'];
    for (const verb of learningVerbs) {
      if (objective.toLowerCase().startsWith(verb)) {
        const question = objective.substring(verb.length).trim();
        return `What do you ${verb.toLowerCase()} about${question}?`;
      }
    }

    // Default: wrap the objective in a general question
    return `Can you explain ${objective.toLowerCase()}?`;
  };

  if (loading) {
    return <div className="loading">Loading flashcards...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="flashcards-container">
      {!studyMode ? (
        <>
          <div className="flashcards-header">
            <h2>Flashcard Decks</h2>
          </div>

          <div className="decks-grid">
            {decks.map((deck) => (
              <div key={deck.subject} className="deck-card">
                <h3>{deck.subject}</h3>
                <p>{deck.decks.reduce((sum, d) => sum + d.cards.length, 0)} cards total</p>
                <div className="deck-topics">
                  {deck.decks.map((d) => (
                    <div key={d.title} className="deck-topic">
                      <h4>{d.title}</h4>
                      <p>{d.cards.length} cards</p>
                      <button onClick={() => startStudying(d)}>Study Now</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="study-mode">
          <div className="study-header">
            <h2>{currentDeck.title}</h2>
            <p className="card-count">
              Card {currentCardIndex + 1} of {currentDeck.cards.length}
            </p>
          </div>

          <div 
            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={flipCard}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <p>{currentDeck.cards[currentCardIndex].front}</p>
                <button className="show-answer" onClick={flipCard}>
                  Show Answer
                </button>
              </div>
              <div className="flashcard-back">
                <p>{currentDeck.cards[currentCardIndex].back}</p>
                <button className="show-question" onClick={flipCard}>
                  Show Question
                </button>
              </div>
            </div>
          </div>

          <div className="study-controls">
            <button 
              onClick={previousCard}
              disabled={currentCardIndex === 0}
            >
              Previous
            </button>
            <button 
              onClick={nextCard}
              disabled={currentCardIndex === currentDeck.cards.length - 1}
            >
              Next
            </button>
          </div>

          <button className="exit-button" onClick={exitStudyMode}>
            Exit Study Mode
          </button>
        </div>
      )}
    </div>
  );
}

export default Flashcards;
