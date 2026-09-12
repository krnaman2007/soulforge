const { RPG_CONSTANTS, getPrimaryAttributeForCategory } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

class AttributeService {
  /**
   * Calculates the attribute gains for a task or quest.
   * Primary attribute gets full gain, secondary attributes get half gain.
   *
   * @param {Object} params
   * @param {string} params.primaryAttribute - The main category
   * @param {string[]} [params.secondaryAttributes=[]] - Secondary categories
   * @param {string} [params.difficulty='MEDIUM'] - EASY | MEDIUM | HARD | EPIC
   * @returns {Object} Map of character model field names to their point increase
   */
  static calculateAttributeGains({ primaryAttribute, secondaryAttributes = [], difficulty = 'MEDIUM' }) {
    try {
      const baseGain = RPG_CONSTANTS.ATTRIBUTE_GAIN[difficulty] || RPG_CONSTANTS.ATTRIBUTE_GAIN.MEDIUM;
      const secondaryGain = Math.floor(baseGain / 2);

      const gains = {};

      // Map any Category enum to the 6 Core RPG character attribute fields
      const mapCategoryToCoreField = (category) => {
        if (!category) return null;
        const coreAttr = getPrimaryAttributeForCategory(category);
        return coreAttr.toLowerCase();
      };

      const primaryField = mapCategoryToCoreField(primaryAttribute);
      if (primaryField) {
        gains[primaryField] = baseGain;
      }

      for (const cat of secondaryAttributes) {
        const field = mapCategoryToCoreField(cat);
        if (field && field !== primaryField && secondaryGain > 0) {
          gains[field] = (gains[field] || 0) + secondaryGain;
        }
      }

      return gains;
    } catch (error) {
      logger.error('Error calculating attribute gains', { error, primaryAttribute, difficulty });
      return {};
    }
  }
}

module.exports = AttributeService;
