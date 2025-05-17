import { Router } from 'express';
import { gameRouter } from './game';
import { healthRouter } from './health';

export const apiRouter = Router();

apiRouter.use('/games', gameRouter);
apiRouter.use('/health', healthRouter);
