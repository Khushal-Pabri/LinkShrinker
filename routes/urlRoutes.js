const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/url/', urlController.shortUrlGenerator);
router.get('/to/:shortId', urlController.redirectUrl);
router.get('/analytics/:shortId', urlController.getAnalytics)
router.get('/lol/lol', urlController.rickRoll);
router.post('/deleteurl/:shortId', urlController.deleteUrl);
router.get('/qrcode/:shortId', urlController.generateQRCode);

module.exports = router;