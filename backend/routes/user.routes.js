const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload   = require('../middleware/upload.middleware');
const { getAllUsers, getUserById, updateProfile } = require('../controllers/user.controller');

// Update own profile (with optional image)
router.patch('/profile', protect, upload.single('profileImage'), updateProfile);

// Admin routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
