import { useState } from 'react';
import './Flashcards.css';

const sampleDecks = [
  {
    id: 1,
    title: 'Object-Oriented Programming',
    cards: [
      {
        id: 1,
        front: 'What is Encapsulation?',
        back: 'Encapsulation is the bundling of data and the methods that operate on that data within a single unit or object, hiding the internal details and providing an interface.'
      },
      {
        id: 2,
        front: 'What is Inheritance?',
        back: 'Inheritance is a mechanism that allows a class to inherit properties and methods from another class, supporting code reuse and establishing a relationship between parent and child classes.'
      },
      {
        id: 3,
        front: 'What is Polymorphism?',
        back: 'Polymorphism is the ability of different classes to be treated as instances of the same class through base class inheritance. It allows you to perform a single action in different ways.'
      }
    ]
  },
  {
    id: 2,
    title: 'Database Concepts',
    cards: [
      {
        id: 1,
        front: 'What is ACID in database transactions?',
        back: 'ACID stands for Atomicity (transactions are all or nothing), Consistency (database remains in a valid state), Isolation (transactions are independent), and Durability (committed transactions are permanent).'
      }
    ]
  }
];

function Flashcards() {
  const [decks, setDecks] = useState(sampleDecks);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

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

  return (
    <div className="flashcards-container">
      {!studyMode ? (
        <>
          <h2>Flashcard Decks</h2>
          <div className="deck-list">
            {decks.map((deck) => (
              <div key={deck.id} className="deck-card">
                <h3>{deck.title}</h3>
                <p>{deck.cards.length} cards</p>
                <button onClick={() => startStudying(deck)}>Study Now</button>
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
              </div>
              <div className="flashcard-back">
                <p>{currentDeck.cards[currentCardIndex].back}</p>
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
            <button onClick={flipCard}>Flip</button>
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
