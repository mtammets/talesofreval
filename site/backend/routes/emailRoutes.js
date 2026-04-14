const express = require('express');
const router = express.Router();
const {sendBookingEmail, sendContactEmail, sendFreeTourEmail} = require('../controllers/emailController')

router.post('/', sendBookingEmail)
router.post('/contact', sendContactEmail)
router.post('/free-tour', sendFreeTourEmail)

module.exports = router;
