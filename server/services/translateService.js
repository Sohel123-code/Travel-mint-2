/**
 * translateService.js — gpt-4o-mini translation for all 10 Indian languages
 */
const { getOpenAI } = require('./openaiClient');
const logger = require('../utils/logger');

// Canonical language names sent to the model
const LANG_MAP = {
    english: 'English',
    hindi: 'Hindi',
    telugu: 'Telugu',
    tamil: 'Tamil',
    kannada: 'Kannada',
    malayalam: 'Malayalam',
    marathi: 'Marathi',
    gujarati: 'Gujarati',
    bengali: 'Bengali',
    punjabi: 'Punjabi',
};

/**
 * @param {string} text        - text to translate
 * @param {string} targetLang  - key from LANG_MAP
 * @param {string} inputLang   - key from LANG_MAP (for same-language skip)
 */
async function translateText(text, targetLang = 'english', inputLang = '') {
    const openai = getOpenAI();
    const targetFull = LANG_MAP[targetLang.toLowerCase()] || 'English';
    const inputFull = LANG_MAP[inputLang.toLowerCase()] || '';

    logger.info('Translating', { from: inputFull || 'auto', to: targetFull });

    // Skip if same language
    if (inputFull && inputFull.toLowerCase() === targetFull.toLowerCase()) {
        logger.ok('Same language — skipping translation');
        return { translatedText: text, skipped: true };
    }

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 1024,
        messages: [
            {
                role: 'system',
                content: `You are a strict professional translator. Translate the text accurately into ${targetFull}. Do not explain or add extra words. Return only the translated text.`,
            },
            { role: 'user', content: text },
        ],
    });

    const translatedText = response.choices?.[0]?.message?.content?.trim() || '';
    logger.ok('Translation done', { translatedText });

    return { translatedText, skipped: false };
}

module.exports = { translateText };
