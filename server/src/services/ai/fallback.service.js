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

  /**
   * Deterministic heuristic fallback for project planning when AI is unreachable.
   *
   * @param {string} goal
   * @returns {Object} Structured project plan
   */
  static planProjectFallback(goal) {
    const title = goal.length > 50 ? goal.substring(0, 47) + '...' : goal;
    return {
      projectName: `Campaign: ${title}`,
      phases: [
        {
          phaseNumber: 1,
          title: 'Phase 1: Foundation and Research',
          tasks: [
            {
              title: `Research fundamentals for ${title}`,
              primaryAttribute: 'INTELLECT',
              difficulty: 'MEDIUM'
            },
            {
              title: 'Setup development workspace and environment',
              primaryAttribute: 'DISCIPLINE',
              difficulty: 'EASY'
            }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Phase 2: Core Execution and Building',
          tasks: [
            {
              title: `Implement core prototype for ${title}`,
              primaryAttribute: 'INTELLECT',
              difficulty: 'HARD'
            },
            {
              title: 'Refine architecture and iterate on key features',
              primaryAttribute: 'CREATIVITY',
              difficulty: 'MEDIUM'
            }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Phase 3: Final Polishing and Deployment',
          tasks: [
            {
              title: `Complete capstone milestone for ${title}`,
              primaryAttribute: 'CAREER',
              difficulty: 'EPIC'
            },
            {
              title: 'Document system findings and share results',
              primaryAttribute: 'SOCIAL',
              difficulty: 'MEDIUM'
            }
          ]
        }
      ]
    };
  }

  /**
   * Deterministic heuristic fallback for habit planning when AI is unreachable.
   *
   * @param {string} habitGoal
   * @returns {Object} Structured habit plan
   */
  static planHabitFallback(habitGoal) {
    const title = habitGoal.length > 40 ? habitGoal.substring(0, 37) + '...' : habitGoal;
    return {
      campaignName: `7-Day Habit: ${title}`,
      days: [
        { dayNumber: 1, title: `Start small: 2 minutes of ${title}`, primaryAttribute: 'DISCIPLINE', difficulty: 'EASY' },
        { dayNumber: 2, title: `Anchor ${title} to your morning routine`, primaryAttribute: 'DISCIPLINE', difficulty: 'EASY' },
        { dayNumber: 3, title: `Extend ${title} duration slightly`, primaryAttribute: 'DISCIPLINE', difficulty: 'MEDIUM' },
        { dayNumber: 4, title: `Eliminate distractions during ${title}`, primaryAttribute: 'DISCIPLINE', difficulty: 'MEDIUM' },
        { dayNumber: 5, title: `Track progress and log consistency`, primaryAttribute: 'LEARNING', difficulty: 'MEDIUM' },
        { dayNumber: 6, title: `Deep focus session for ${title}`, primaryAttribute: 'DISCIPLINE', difficulty: 'HARD' },
        { dayNumber: 7, title: `Reflect on 1-week milestone and reward yourself`, primaryAttribute: 'PERSONAL_GROWTH', difficulty: 'HARD' }
      ]
    };
  }
}

module.exports = FallbackService;
