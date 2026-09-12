const { z } = require('zod');

const challengeTypeParamSchema = z.object({
  type: z.enum(['daily', 'weekly', 'DAILY', 'WEEKLY'], {
    errorMap: () => ({ message: 'Challenge type must be either daily or weekly' })
  }).transform(val => val.toUpperCase())
});

module.exports = {
  challengeTypeParamSchema
};
