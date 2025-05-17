import { HealthController } from "@/controllers/health.controller";
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", HealthController.check);
