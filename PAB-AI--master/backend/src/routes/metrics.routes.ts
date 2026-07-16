import { Router, Request, Response } from 'express';
import { getMetrics, getSummaryMetrics } from '../middleware/logger.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

// GET /api/metrics — full recent request log
router.get('/', (_req: Request, res: Response) => {
  const recent = getMetrics().slice(-100); // last 100 requests
  res.json({ success: true, metrics: recent });
});

// GET /api/metrics/summary — aggregated stats
router.get('/summary', (_req: Request, res: Response) => {
  res.json({ success: true, summary: getSummaryMetrics() });
});

export default router;
