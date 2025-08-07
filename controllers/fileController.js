const { v4: uuidv4 } = require('uuid');
const { uploadToS3, downloadFromS3 } = require('../utils/s3');
const { encrypt, decrypt } = require('../utils/encryption');
const File = require('../models/File');
const multer = require('multer');

// Multer setup to store file in memory before processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => cb(null, true), // Accept all files; customize if needed
}).single('file');

// Upload File Handler
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Encrypt file buffer and get IV
    const { encryptedData, iv } = encrypt(req.file.buffer);

    // Generate unique S3 key for the file
    const s3Key = `encrypted-files/${uuidv4()}-${req.file.originalname}`;

    // Upload encrypted file to S3
    await uploadToS3(encryptedData, s3Key, 'application/octet-stream');

    // Save metadata and encryption IV to DB
    const fileDoc = await File.create({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      s3Key,
      uploadedBy: req.user._id,
      encryptionIV: iv,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.json({
      message: 'File uploaded successfully',
      fileId: fileDoc._id,
      filename: fileDoc.filename,
      size: fileDoc.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
};

// Generate Share Link Handler
const generateShareLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { expiresInMinutes  = 60 } = req.body;

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create a unique share token and expiry date
    const shareToken = uuidv4();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Save token to file document
    file.shareTokens.push({ token: shareToken, expiresAt });
    await file.save();

    res.json({
      message: 'Share link generated',
      shareLink: `${req.protocol}://${req.get('host')}/api/files/download/${shareToken}`,
      expiresAt,
      token: shareToken,
    });
  } catch (error) {
    console.error('Share link error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

// Get User Files Handler
const getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id })
      .select('filename originalName size mimeType createdAt')
      .sort({ createdAt: -1 });

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// Download File by Share Token Handler
const downloadFile = async (req, res) => {
  try {
    const { token } = req.params;

    // Find file by share token and check expiry
    const file = await File.findOne({
      'shareTokens.token': token,
      'shareTokens.expiresAt': { $gt: new Date() },
    });
    if (!file) return res.status(404).json({ error: 'Invalid or expired download link' });

    // Download encrypted file from S3 and decrypt it
    const encryptedData = await downloadFromS3(file.s3Key);
    const decryptedData = decrypt(encryptedData, file.encryptionIV);

    // Set headers to prompt file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', decryptedData.length);

    // Send decrypted file data
    res.send(decryptedData);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed: ' + error.message });
  }
};

module.exports = {
  upload: [upload, uploadFile], // multer middleware + upload handler combo
  generateShareLink,
  getUserFiles,
  downloadFile,
};
