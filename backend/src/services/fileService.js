const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../middleware/errorHandler');

// File service for handling file operations
const fileService = {
  // Ensure upload directory exists
  ensureUploadDir: async () => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
      logger.info('Upload directory created');
    }
  },

  // Delete file
  deleteFile: async (filePath) => {
    try {
      await fs.unlink(filePath);
      logger.info(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      logger.error('Delete file error:', error);
      return false;
    }
  },

  // Get file info
  getFileInfo: async (filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      logger.error('Get file info error:', error);
      throw new Error('File not found');
    }
  },

  // Validate file type
  validateFileType: (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
  },

  // Generate secure filename
  generateSecureFilename: (originalname) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalname);
    return `${timestamp}-${random}${extension}`;
  }
};

module.exports = fileService;