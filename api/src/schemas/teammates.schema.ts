import { z } from "zod";

export const connectSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
  }),
});

export const chatParamsSchema = z.object({
  params: z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
  }),
});
