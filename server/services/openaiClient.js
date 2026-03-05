/**
 * openaiClient.js — singleton OpenAI client
 */
const OpenAI = require('openai');
const logger = require('../utils/logger');

let _client = null;

function getOpenAI() {
    if (!_client) {
        if (!process.env.OPENAI_API_KEY) {
            logger.error('OPENAI_API_KEY is not set in server/.env');
            throw new Error('OPENAI_API_KEY is missing. Add it to server/.env');
        }
        _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        logger.ok('OpenAI client initialized');
    }
    return _client;
}

module.exports = { getOpenAI };
