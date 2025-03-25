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
}

module.exports = router;
