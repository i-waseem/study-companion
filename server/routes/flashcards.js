const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Curriculum = require('../models/Curriculum');

// Generate flashcards from curriculum data for a specific subject
router.get('/:gradeLevel/:subject', auth, async (req, res) => {
  try {
    const { gradeLevel, subject } = req.params;
    
    // Convert grade level and subject to proper format
    const formattedGradeLevel = gradeLevel.toLowerCase() === 'o-level' ? 'O-Level' : gradeLevel;
    
    // Special handling for Pakistan Studies subjects
    let formattedSubject;
    if (subject === 'pakistan-studies-history') {
      formattedSubject = 'Pakistan Studies - History';
    } else if (subject === 'pakistan-studies-geography') {
      formattedSubject = 'Pakistan Studies - Geography';
    } else {
      // Standard formatting for other subjects
      formattedSubject = subject.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    console.log(`Generating flashcards for ${formattedGradeLevel} ${formattedSubject}`);

    const curriculum = await Curriculum.findOne({
      gradeLevel: formattedGradeLevel,
      subject: formattedSubject
    }).lean();

    if (!curriculum) {
      console.error(`No curriculum found for ${formattedGradeLevel} ${formattedSubject}`);
      return res.status(404).json({ 
        message: `No curriculum found for ${formattedGradeLevel} ${formattedSubject}` 
      });
    }

    // Generate flashcards from curriculum data
    const flashcardDecks = [];
    
    // Create a deck for each topic in the curriculum
    curriculum.topics.forEach(topic => {
      const deck = {
        id: topic.name.toLowerCase().replace(/\s+/g, '-'),
        title: topic.name,
        cards: []
      };
      
      // Create flashcards for each subtopic's learning objectives
      topic.subtopics.forEach(subtopic => {
        subtopic.learningObjectives.forEach((objective, index) => {
          // Create a question from the learning objective
          const card = {
            id: `${deck.id}-${subtopic.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
            front: generateFlashcardQuestion(objective, subtopic.name),
            back: objective
          };
          
          deck.cards.push(card);
        });
      });
      
      // Only add decks that have cards
      if (deck.cards.length > 0) {
        flashcardDecks.push(deck);
      }
    });

    // Log the number of decks and cards for debugging
    console.log(`Generated ${flashcardDecks.length} decks with a total of ${flashcardDecks.reduce((sum, deck) => sum + deck.cards.length, 0)} cards`);

    res.json({ 
      gradeLevel: formattedGradeLevel,
      subject: formattedSubject,
      decks: flashcardDecks 
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ message: 'Failed to generate flashcards' });
  }
});

// Helper function to generate a question from a learning objective
function generateFlashcardQuestion(objective, subtopicName) {
  // Remove common starting phrases to create a question
  let question = objective
    .replace(/^Understand /, '')
    .replace(/^Explain /, '')
    .replace(/^Define /, '')
    .replace(/^Identify /, '')
    .replace(/^Analyze /, '')
    .replace(/^Compare /, '')
    .replace(/^Describe /, '');
  
  // Capitalize first letter
  question = question.charAt(0).toUpperCase() + question.slice(1);
  
  // Add a question mark if it doesn't end with one
  if (!question.endsWith('?')) {
    // Convert statement to question format
    if (question.includes(' and ')) {
      question = `What are the key points about ${question}?`;
    } else {
      question = `Can you explain ${question.toLowerCase()}?`;
    }
  }
  
  return question;
}

module.exports = router;
