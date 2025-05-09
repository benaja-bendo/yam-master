import { Request, Response } from 'express';

export class HealthController {
  static check(req: Request, res: Response) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'yamaster-backend'
    });
  }
}