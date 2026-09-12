const { z } = require('zod');

const userIdParamSchema = z.object({
  userId: z.string().trim().min(1, 'User ID is required')
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20)
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Search query must be at least 2 characters'),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20)
});

module.exports = {
  userIdParamSchema,
  paginationQuerySchema,
  searchQuerySchema
};
