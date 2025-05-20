import { z } from "zod";

export const createGameSchema = z
  .object({
    mode: z.enum(["pvp", "pvb"]),
    botDifficulty: z.string().optional(),
  })
  .refine(
    (data) => data.mode === "pvp" || data.botDifficulty != null,
    {
      message: "botDifficulty est requis quand mode = 'pvb'",
      path: ["botDifficulty"],
    }
  );