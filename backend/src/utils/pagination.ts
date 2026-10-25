import { z } from 'zod';

// Reusable validation fields for any list endpoint
export const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
};

// Turns page/limit into the row range the database needs
export const getRange = (page: number, limit: number) => {
  const from = (page - 1) * limit;
  return { from, to: from + limit - 1 };
};