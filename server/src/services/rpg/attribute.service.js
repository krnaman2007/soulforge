const { RPG_CONSTANTS } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

class AttributeService {
  /**
   * Calculates the attribute gains for a task.
   * Primary attribute gets full gain, secondary attributes get half gain.
   *
   * @param {Object} params
   * @param {string} params.primaryAttribute - The main category
   * @param {string[]} params.secondaryAttributes - Secondary categories
   * @param {string} params.difficulty - EASY | MEDIUM | HARD | EPIC
   * @returns {Object} Map of attribute names to their point increase
   */
  static calculateAttributeGains({ primaryAttribute, secondaryAttributes = [], difficulty }) {
    try {
      const baseGain = RPG_CONSTANTS.ATTRIBUTE_GAIN[difficulty] || RPG_CONSTANTS.ATTRIBUTE_GAIN.MEDIUM;
      const secondaryGain = Math.floor(baseGain / 2);

      const gains = {};

      // Map Prisma enums to model field names
      const mapCategoryToField = (category) => {
        if (!category) return null;
        // PHYSICAL maps to strength in the Character model (or we kept strength in the schema)
        if (category === 'STRENGTH' || category === 'PHYSICAL') return 'strength';
        if (category === 'PERSONAL_GROWTH') return 'personalGrowth';
        return category.toLowerCase();
      };

      const primaryField = mapCategoryToField(primaryAttribute);
      if (primaryField) {
        gains[primaryField] = baseGain;
      }

      for (const cat of secondaryAttributes) {
        const field = mapCategoryToField(cat);
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
