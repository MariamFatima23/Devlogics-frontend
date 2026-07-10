const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

// Helper: Generate fresh token
const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      department: user.department,
      batchester: user.batchester,
      phone: user.phone,
      profileImage: user.profileImage,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Get all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update profile — also returns a fresh token so navbar updates immediately
const updateProfile = async (req, res) => {
  try {
    const { name, phone, rollNumber, department, batchester } = req.body;

    const updateData = { name, phone, rollNumber, department, batchester };

    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }           // return updated document
    ).select('-password');

    // ✅ SOLUTION 2: Naya token generate karo updated name ke saath
    const newToken = generateToken(user);

    res.json({
      message: 'Profile updated successfully',
      token: newToken,   // ← fresh token with new name
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        batchester: user.batchester,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile };
