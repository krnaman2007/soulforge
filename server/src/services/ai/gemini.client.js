const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../../config/env');
const { AI_CONFIG } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

const geminiApiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.LLM_API_KEY;

let genAI = null;

if (geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    logger.info('Gemini AI client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Gemini AI client', { error: error.message });
  }
} else {
  logger.warn('GEMINI_API_KEY is not set. AI services will use deterministic fallbacks.');
}

/**
 * Wraps a promise with a timeout to guarantee responsiveness.
 *
 * @param {Promise} promise
 * @param {number} timeoutMs
 * @returns {Promise}
 */
const withTimeout = (promise, timeoutMs = AI_CONFIG.GEMINI_TIMEOUT_MS) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('GEMINI_API_TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

/**
 * Strips markdown code blocks if the model wrapped the JSON.
 *
 * @param {string} text
 * @returns {string}
 */
function cleanJsonOutput(text) {
  if (!text) return '{}';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Calls Gemini with strict JSON formatting.
 * Compatible with the message format [{ role: 'system', content }, { role: 'user', content }].
 *
 * @param {Array<{role: string, content: string}> | string} messages
 * @param {string} modelName
 * @param {number} temperature
 * @returns {Promise<any>}
 */
async function generateJson(messages, modelName = AI_CONFIG.GEMINI_MODEL, temperature = 0.2) {
  if (!genAI || !geminiApiKey) {
    throw new Error('GEMINI_CLIENT_NOT_INITIALIZED');
  }

  let systemInstruction = '';
  let userPrompt = '';

  if (Array.isArray(messages)) {
    const sysMsg = messages.find(m => m.role === 'system');
    if (sysMsg) {
      systemInstruction = sysMsg.content;
    }
    const userMsgs = messages.filter(m => m.role === 'user');
    userPrompt = userMsgs.map(m => m.content).join('\n\n');
  } else if (typeof messages === 'string') {
    userPrompt = messages;
  }

  const modelOptions = {
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature
    }
  };

  if (systemInstruction) {
    modelOptions.systemInstruction = systemInstruction;
  }

  const generativeModel = genAI.getGenerativeModel(modelOptions);

  try {
    const promise = generativeModel.generateContent(userPrompt);
    const result = await withTimeout(promise, AI_CONFIG.GEMINI_TIMEOUT_MS);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Empty response received from Gemini');
    }

    const cleaned = cleanJsonOutput(responseText);
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('Gemini AI Request Failed', { error: error.message, modelName });
    throw error;
  }
}

module.exports = {
  genAI,
  generateJson
};
