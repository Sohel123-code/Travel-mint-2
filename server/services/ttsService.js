/**
 * ttsService.js
 * Converts text to MP3 audio using OpenAI TTS API.
 */
const { getOpenAI } = require('./openaiClient');
const logger = require('../utils/logger');

const VOICES = {
    female: 'nova',    // warm female voice
    male: 'onyx',    // deep male voice
};

/**
 * @param {string} text    - text to speak
 * @param {string} gender  - 'female' | 'male'
 * @returns {Buffer}       - MP3 audio buffer
 */
async function generateSpeech(text, gender = 'female') {
    const openai = getOpenAI();
    const voice = VOICES[gender] || VOICES.female;

    logger.info('Generating TTS audio', { voice, textLength: text.length });

    let response;
    try {
        response = await openai.audio.speech.create({
            model: 'gpt-4o-mini-tts',
            voice,
            input: text,
            response_format: 'mp3',
            speed: 0.95,
        });
    } catch (err) {
        // Fallback to tts-1 if gpt-4o-mini-tts unavailable
        if (err?.status === 404 || err?.code === 'model_not_found') {
            logger.warn('gpt-4o-mini-tts not available, falling back to tts-1');
            response = await openai.audio.speech.create({
                model: 'tts-1',
                voice,
                input: text,
                response_format: 'mp3',
                speed: 0.95,
            });
        } else {
            throw err;
        }
    }

    // Convert response to Buffer
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    logger.ok('TTS complete', { voice, outputBytes: audioBuffer.length });

    return audioBuffer;
}

module.exports = { generateSpeech };
