import { Request, Response } from 'express';

export class HealthController {
  static check(req: Request, res: Response) {
    res.json({
      status: 'ok',
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: '@yamaster/backend'
    });
  }
}