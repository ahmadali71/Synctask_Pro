const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  refreshToken,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema } = require('../validators/userValidators');

router.post('/', validate(registerSchema), registerUser);
router.post('/auth', validate(loginSchema), authUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
