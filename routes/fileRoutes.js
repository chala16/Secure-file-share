const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { 
  upload, 
  generateShareLink, 
  getUserFiles,
  downloadFile
} = require('../controllers/fileController');

// POST /api/files/upload
router.post('/upload', authenticate, ...upload);

// POST /api/files/share/:fileId
router.post('/share/:fileId', authenticate, generateShareLink);

// GET /api/files/my-files
router.get('/my-files', authenticate, getUserFiles);

// GET /api/files/download/:token
router.get('/download/:token', downloadFile); 


module.exports = router;