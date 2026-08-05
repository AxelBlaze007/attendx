import { z } from "zod";

export const redeemSchema = z.object({
  body: z.object({
    rewardItemId: z.string().min(1, "Reward item ID is required"),
  }),
});

export const itemQuerySchema = z.object({
  query: z.object({
    category: z.enum(["CANTEEN", "STATIONERY", "PRINTING"]).optional(),
  }),
});
