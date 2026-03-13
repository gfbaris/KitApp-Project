const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getUser, updateUser, deleteUser } = require('../controllers/user.controller');

router.get('/:userId', authMiddleware, getUser);
router.put('/:userId', authMiddleware, updateUser);
router.delete('/:userId', authMiddleware, deleteUser);

module.exports = router;
