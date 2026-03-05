/**
 * transcribeService.js
 * Sends audio buffer to OpenAI Transcription API.
 * Returns: { text, language, duration }
 */
const { getOpenAI } = require('./openaiClient');
const logger = require('../utils/logger');
const { toFile } = require('openai');

/**
 * @param {Buffer} audioBuffer  - raw audio bytes from Multer
 * @param {string} mimeType     - e.g. 'audio/webm'
 * @returns {{ text: string, language: string, duration: number }}
 */
async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
    const openai = getOpenAI();

    logger.info('Transcribing audio...', { bytes: audioBuffer.length, mimeType });

    // Convert buffer → File object OpenAI SDK expects
    const file = await toFile(audioBuffer, 'recording.webm', { type: mimeType });

    let response;
    try {
        response = await openai.audio.transcriptions.create({
            model: 'gpt-4o-mini-transcribe',
            file,
            response_format: 'verbose_json',   // includes language + segments
        });
    } catch (err) {
        // Fallback to whisper-1 if gpt-4o-mini-transcribe is unavailable
        if (err?.status === 404 || err?.code === 'model_not_found') {
            logger.warn('gpt-4o-mini-transcribe not available, falling back to whisper-1');
            response = await openai.audio.transcriptions.create({
                model: 'whisper-1',
                file,
                response_format: 'verbose_json',
            });
        } else {
            throw err;
        }
    }

    const result = {
        text: response.text?.trim() || '',
        language: response.language || 'unknown',
        duration: response.duration || 0,
    };

    logger.ok('Transcription complete', {
        detectedLanguage: result.language,
        transcribedText: result.text,
        duration: `${result.duration.toFixed(1)}s`,
    });

    return result;
}

module.exports = { transcribeAudio };
