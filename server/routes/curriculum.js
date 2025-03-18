const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Curriculum = require('../models/Curriculum');

// Get curriculum by grade and subject
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

    console.log(`Fetching curriculum for ${formattedGradeLevel} ${formattedSubject}`);
    console.log('Query:', { gradeLevel: formattedGradeLevel, subject: formattedSubject });

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

    // Validate curriculum structure
    if (!curriculum.topics || !Array.isArray(curriculum.topics)) {
      console.error('Invalid curriculum structure - missing or invalid topics array');
      return res.status(500).json({ 
        message: 'Invalid curriculum structure' 
      });
    }

    // Validate each topic and subtopic
    for (const topic of curriculum.topics) {
      if (!topic.name || !topic.subtopics || !Array.isArray(topic.subtopics)) {
        console.error('Invalid topic structure:', topic);
        return res.status(500).json({ 
          message: 'Invalid topic structure in curriculum' 
        });
      }

      for (const subtopic of topic.subtopics) {
        if (!subtopic.name || !subtopic.learningObjectives || !Array.isArray(subtopic.learningObjectives)) {
          console.error('Invalid subtopic structure:', subtopic);
          return res.status(500).json({ 
            message: 'Invalid subtopic structure in curriculum' 
          });
        }
      }
    }

    console.log('Found curriculum:', {
      gradeLevel: curriculum.gradeLevel,
      subject: curriculum.subject,
      topicsCount: curriculum.topics.length,
      topics: curriculum.topics.map(t => ({
        name: t.name,
        subtopicsCount: t.subtopics.length
      }))
    });

    res.json(curriculum);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ message: 'Failed to fetch curriculum data' });
  }
});

// Get all available subjects for a grade
router.get('/:gradeLevel/subjects', auth, async (req, res) => {
  try {
    const { gradeLevel } = req.params;
    const curricula = await Curriculum.find({ gradeLevel });
    const subjects = curricula.map(c => c.subject);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new curriculum
router.post('/', auth, async (req, res) => {
  try {
    const curriculum = new Curriculum(req.body);
    await curriculum.save();
    res.status(201).json(curriculum);
  } catch (error) {
    console.error('Error creating curriculum:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update curriculum
router.put('/:gradeLevel/:subject', auth, async (req, res) => {
  try {
    const { gradeLevel, subject } = req.params;
    const curriculum = await Curriculum.findOneAndUpdate(
      { gradeLevel, subject },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    
    res.json(curriculum);
  } catch (error) {
    console.error('Error updating curriculum:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all available subjects
router.get('/subjects', auth, async (req, res) => {
  try {
    console.log('Fetching all subjects...');
    const curricula = await Curriculum.find({}, 'gradeLevel subject').lean();
    
    // Format the subjects for the frontend
    const subjects = curricula.map(c => {
      let urlFriendlySubject = '';
      
      // Special handling for Pakistan Studies subjects
      if (c.subject === 'Pakistan Studies - History') {
        urlFriendlySubject = 'pakistan-studies-history';
      } else if (c.subject === 'Pakistan Studies - Geography') {
        urlFriendlySubject = 'pakistan-studies-geography';
      } else {
        // Convert other subjects to URL-friendly format
        urlFriendlySubject = c.subject.toLowerCase().replace(/ /g, '-');
      }
      
      return {
        gradeLevel: c.gradeLevel,
        subject: c.subject,
        urlFriendlySubject: urlFriendlySubject
      };
    });
    
    console.log('Found subjects:', subjects);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// Get curriculum by subject
router.get('/o-level/:subject', auth, async (req, res) => {
  try {
    const { subject } = req.params;
    console.log('Fetching curriculum for subject:', subject);
    
    // Format subject name based on pattern
    let formattedSubject;
    
    // Special handling for Pakistan Studies subjects
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

    console.log('Formatted subject name:', formattedSubject);

    const curriculum = await Curriculum.findOne({
      gradeLevel: 'O-Level',
      subject: formattedSubject
    });

    if (!curriculum) {
      console.log('Curriculum not found for subject:', formattedSubject);
      return res.status(404).json({ message: 'Curriculum not found' });
    }

    console.log('Found curriculum for', formattedSubject);
    res.json(curriculum);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ message: 'Failed to fetch curriculum' });
  }
});

module.exports = router;
