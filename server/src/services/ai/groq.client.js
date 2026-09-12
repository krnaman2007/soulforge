const Groq = require('groq-sdk');
const env = require('../../config/env');
const { AI_CONFIG } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

const groqApiKey = env.GROQ_API_KEY || env.LLM_API_KEY;

let groqClient = null;

if (groqApiKey) {
  try {
    groqClient = new Groq({ apiKey: groqApiKey });
  } catch (error) {
    logger.error('Failed to initialize Groq client', { error });
  }
} else {
  logger.warn('GROQ_API_KEY is not set. AI services will use deterministic fallbacks.');
}

/**
 * Wraps the Groq API call with a timeout to preserve UI responsiveness.
 *
 * @param {Promise} promise
 * @param {number} timeoutMs
 * @returns {Promise}
 */
const withTimeout = (promise, timeoutMs = AI_CONFIG.GROQ_TIMEOUT_MS) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('GROQ_API_TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

/**
 * Calls Groq chat completions with strict JSON formatting.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} model
 * @param {number} temperature
 * @returns {Promise<any>}
 */
async function generateJson(messages, model = 'llama3-8b-8192', temperature = 0.2) {
  if (!groqClient) {
    throw new Error('GROQ_CLIENT_NOT_INITIALIZED');
  }

  const promise = groqClient.chat.completions.create({
    messages,
    model,
    temperature,
    response_format: { type: 'json_object' }
  });

  try {
    const response = await withTimeout(promise);
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }
    return JSON.parse(content);
  } catch (error) {
    logger.error('Groq AI Request Failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  groqClient,
  generateJson
};
