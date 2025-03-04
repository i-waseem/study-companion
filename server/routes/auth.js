const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
  console.log('\n=== Registration Attempt ===');
  console.log('Request headers:', {
    origin: req.headers.origin,
    'content-type': req.headers['content-type'],
    cookie: req.headers.cookie
  });
  console.log('Request body:', {
    username: req.body.username,
    email: req.body.email,
    hasPassword: !!req.body.password,
    passwordLength: req.body.password?.length
  });
  
  try {
    // Check if required environment variables are set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      console.log('Missing required fields:', { 
        username: !!username, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        fields: {
          username: !!username,
          email: !!email,
          password: !!password
        }
      });
    }

    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long',
        provided: password.length
      });
    }

    // Check if user exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      console.log('User already exists:', {
        existingEmail: existingUser.email === email,
        existingUsername: existingUser.username === username
      });
      return res.status(400).json({ 
        message: 'User already exists',
        conflict: {
          email: existingUser.email === email,
          username: existingUser.username === username
        }
      });
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    console.log('Creating new user...');
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', {
      id: user._id,
      username: user.username,
      email: user.email
    });

    // Create token
    console.log('Creating JWT token...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    console.log('Setting cookie with options:', cookieOptions);
    res.cookie('token', token, cookieOptions);

    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    console.log('Registration successful, sending response');
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field} already exists`,
        field: field
      });
    }

    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code
      } : undefined
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log('\n=== Login Attempt ===');
  console.log('Request body:', {
    email: req.body.email,
    hasPassword: !!req.body.password,
    passwordLength: req.body.password?.length
  });
  
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log('Missing credentials:', { 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Find user by email with password field
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log user data (excluding sensitive info)
    console.log('Found user:', {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Compare password using the model method
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    console.log('Creating JWT token...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    console.log('Setting cookie with options:', cookieOptions);
    res.cookie('token', token, cookieOptions);

    // Send response
    console.log('Login successful:', email);
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
