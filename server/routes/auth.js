const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const { validateUser } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register
router.post('/register', validateUser, async (req, res) => {
  try {
    const { name, email, phone, password, isAnonymous } = req.body;

    // Check if user already exists
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
    }

    if (phone) {
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this phone number already exists' });
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      password: isAnonymous ? null : password,
      isAnonymous: isAnonymous || false
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAnonymous: user.isAnonymous
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password, name, isAnonymous } = req.body;

    // Handle anonymous login by name
    if (isAnonymous && name) {
      const user = await User.findOne({
        where: {
          name: name,
          isAnonymous: true,
          isActive: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Anonymous user not found' });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      const token = generateToken(user.id);

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAnonymous: user.isAnonymous
        }
      });
    }

    // Handle regular login with email/phone
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email, phone, or name required' });
    }

    const user = await User.findOne({
      where: {
        [email ? 'email' : 'phone']: email || phone
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isAnonymous && password) {
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAnonymous: user.isAnonymous
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('Auth /me endpoint called for user:', req.user.id);
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        isAnonymous: req.user.isAnonymous,
        profilePicture: req.user.profilePicture
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, validateUser, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (password) updates.password = password;

    await req.user.update(updates);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        isAnonymous: req.user.isAnonymous,
        profilePicture: req.user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        profilePicture: picture,
        isActive: true,
        isAnonymous: false
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user.googleId = googleId;
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user.id);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAnonymous: user.isAnonymous,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

module.exports = router;
