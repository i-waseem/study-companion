const express = require('express');
const router = express.Router();
const Curriculum = require('../models/Curriculum');

// Get curriculum by grade and subject
router.get('/:gradeLevel/:subject', async (req, res) => {
  try {
    const { gradeLevel, subject } = req.params;
    const curriculum = await Curriculum.findOne({ gradeLevel, subject });
    
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    
    res.json(curriculum);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all available subjects for a grade
router.get('/:gradeLevel/subjects', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:gradeLevel/:subject', async (req, res) => {
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

module.exports = router;
