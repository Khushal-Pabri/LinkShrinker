const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.get('/getmyurls', userController.getUserUrls);

module.exports = router;