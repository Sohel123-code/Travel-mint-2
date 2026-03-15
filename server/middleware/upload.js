/**
 * upload.js — Multer middleware (memory storage, accepts audio files)
 */
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept audio and video MIME types (browser MediaRecorder uses audio/webm)
    const allowed = [
        'audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp4',
        'audio/mpeg', 'audio/mp3', 'audio/x-m4a',
        'video/webm',                            // Chrome MediaRecorder fallback
        'application/octet-stream',              // some browsers omit MIME
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported MIME type: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB (OpenAI limit)
});

module.exports = upload;
