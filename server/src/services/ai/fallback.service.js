const { AI_CONFIG } = require('../../config/constants');

class FallbackService {
  /**
   * Deterministic heuristic classifier used if the AI provider fails or times out.
   * Based on regex patterns for common task types.
   *
   * @param {string} title
   * @param {string} [description='']
   * @returns {Object} Extracted task metadata
   */
  static classifyTaskFallback(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();

    // Default values
    let primaryAttribute = 'DISCIPLINE';
    let difficulty = 'MEDIUM';
    const effort = 'MEDIUM';
    const impact = 'MEDIUM';
    const priority = 'MEDIUM';
    const suspicion = 'NORMAL';

    // Attribute Heuristics
    if (/(code|program|study|exam|algorithm|dbms|read|book|math|research|learn|tutorial)/.test(text)) {
      primaryAttribute = 'INTELLECT';
    } else if (/(gym|workout|lift|run|cardio|pushup|training|jog|exercise|deadlift|squat)/.test(text)) {
      primaryAttribute = 'PHYSICAL'; // Maps to Strength
    } else if (/(water|sleep|hydrate|stretch|walk|meal|cook|nutrition|doctor|med|floss)/.test(text)) {
      primaryAttribute = 'HEALTH';
    } else if (/(draw|design|write|compose|sketch|music|paint|video|ui|craft|guitar)/.test(text)) {
      primaryAttribute = 'CREATIVITY';
    } else if (/(call|meet|family|friend|network|party|talk|mentor|volunteer|email)/.test(text)) {
      primaryAttribute = 'SOCIAL';
    } else if (/(wake|clean|meditate|organize|budget|journal|laundry|focus|plan)/.test(text)) {
      primaryAttribute = 'DISCIPLINE';
    } else if (/(lead|manage|team|pitch|present|coach|direct|strategy)/.test(text)) {
      primaryAttribute = 'LEADERSHIP';
    } else if (/(save|invest|finance|tax|stock|crypto|pay|bill|budget)/.test(text)) {
      primaryAttribute = 'FINANCE';
    } else if (/(job|resume|interview|career|promotion|apply|linkedin)/.test(text)) {
      primaryAttribute = 'CAREER';
    } else if (/(therapy|feelings|emotional|reflect|calm|breathe|anger)/.test(text)) {
      primaryAttribute = 'EMOTIONAL';
    }

    // Difficulty Heuristics
    if (/(quick|easy|5 min|10 min|short|simple)/.test(text)) {
      difficulty = 'EASY';
    } else if (/(exam|project|thesis|marathon|heavy|master|hard|intense)/.test(text)) {
      difficulty = 'HARD';
    } else if (/(epic|launch|hackathon|championship|final)/.test(text)) {
      difficulty = 'EPIC';
    }

    return {
      primaryAttribute,
      secondaryAttributes: [],
      priority,
      difficulty,
      effort,
      impact,
      confidence: AI_CONFIG.FALLBACK_CONFIDENCE,
      suspicion
    };
  }
}

module.exports = FallbackService;
