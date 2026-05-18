const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  getUsers
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
