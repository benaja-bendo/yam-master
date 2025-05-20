import type { Request } from "express";
import { createGameSchema } from '../validation/createGame';
import { z } from "zod";

export interface RequestWithBody<T> extends Request {
  body: T;
}

export type BodyCreateGame = {
  mode: "pvp" | "pvb";
  botDifficulty?: "easy" | "hard";
};

//export type BodyCreateGame = z.infer<typeof createGameSchema>;