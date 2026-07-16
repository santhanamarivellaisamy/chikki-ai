import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Update requests with validated content
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) {
        // Clear existing properties and assign validated ones
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params) {
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, parsed.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            details: error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
};
